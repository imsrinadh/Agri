import io
import json
import uuid
import logging
import base64
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

import numpy as np
from PIL import Image
import httpx

import importlib

torch = None
nn = None
models = None
transforms = None
HAS_TORCH = None
AutoModelForImageClassification = None
HAS_TRANSFORMERS = None

def _load_torch_deps():
    global torch, nn, models, transforms, HAS_TORCH, AutoModelForImageClassification, HAS_TRANSFORMERS
    if HAS_TORCH is not None:
        return HAS_TORCH
    try:
        import importlib
        torch = importlib.import_module("torch")
        nn = importlib.import_module("torch.nn")
        _torchvision = importlib.import_module("torchvision")
        models = getattr(_torchvision, "models", None)
        transforms = importlib.import_module("torchvision.transforms")
        HAS_TORCH = True
    except Exception:
        torch = None
        nn = None
        models = None
        transforms = None
        HAS_TORCH = False

    try:
        from transformers import AutoModelForImageClassification as _AutoModel
        AutoModelForImageClassification = _AutoModel
        HAS_TRANSFORMERS = True
    except Exception:
        AutoModelForImageClassification = None
        HAS_TRANSFORMERS = False

    return HAS_TORCH

from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)

# File size & formats
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}

# Model paths
DISEASE_MODEL_DIR = Path(__file__).resolve().parent.parent / "ml" / "disease" / "models"
HF_MODEL_ID = "mesabo/agri-plant-disease-resnet50"
RESNET50_MODEL_PATH = DISEASE_MODEL_DIR / "disease_resnet50.pth"
CNN_MODEL_PATH = DISEASE_MODEL_DIR / "disease_cnn.pth"

_LOCAL_MODEL = None
_LOCAL_TRANSFORM = None
_LOCAL_ID2LABEL: Dict[int, str] = {}
_LOCAL_ENGINE_NAME = "PyTorch ResNet-50 Deep CNN (38-Class PlantVillage Benchmark)"

# In-memory history for quick lookups
_DISEASE_HISTORY: List[Dict[str, Any]] = []

# ==============================================================================
# Comprehensive Agronomical Knowledge Base (38 PlantVillage + Extended Staples)
# ==============================================================================
DISEASE_CATALOG: Dict[str, Dict[str, Any]] = {
    # ---------------- Rose ----------------
    "Rose___Black_spot": {
        "crop": "Rose",
        "scientific_name": "Rosa spp.",
        "plant_family": "Rosaceae",
        "condition": "Rose Black Spot",
        "pathogen": "Diplocarpon rosae",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Pronounced dark brown-to-black circular spots with fringed/feathery margins, surrounded by prominent bright yellow chlorotic halos on ovate serrated leaves.",
        "causes": "High relative humidity (>85%) and free water on foliage for >7 hours at moderate temperatures (18–25°C).",
        "recommendations": [
            "Apply Difenoconazole 25% EC at 0.5 ml/L or Azoxystrobin + Difenoconazole at 1 ml/L or Mancozeb 75% WP at 2.5 g/L at 7–10 day intervals.",
            "Spray cold-pressed pure Neem oil (10,000 ppm) at 3 ml/L or potassium bicarbonate (4 g/L) as an organic therapeutic preventative.",
            "Prune and destroy all fallen and spotted leaves; avoid overhead sprinkler watering completely and water strictly at the soil base."
        ]
    },

    # ---------------- Apple ----------------
    "Apple___Alternaria_blotch": {
        "crop": "Apple",
        "scientific_name": "Malus domestica",
        "plant_family": "Rosaceae",
        "condition": "Alternaria Leaf Blotch",
        "pathogen": "Alternaria alternata (apple pathotype)",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Circular brown-to-black necrotic lesions displaying concentric target rings with prominent, radiant yellow chlorotic halos on serrated ovate leaves.",
        "causes": "Alternating wet and dry periods with warm humid weather (24–30°C) and canopy dew.",
        "recommendations": [
            "Foliar spray of Azoxystrobin (18.2%) + Difenoconazole (11.4%) SC at 1 ml/L or Pyraclostrobin 20% WG at 1 g/L.",
            "Prune inner canopy branches to increase airflow and accelerate rapid leaf drying.",
            "Collect and burn infected leaf litter beneath the tree drip-line."
        ]
    },
    "Apple___Apple_scab": {
        "crop": "Apple",
        "scientific_name": "Malus domestica",
        "plant_family": "Rosaceae",
        "condition": "Apple Scab",
        "pathogen": "Venturia inaequalis",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Olive-green to velvety dark brown circular lesions on upper leaf surfaces that become puckered and distorted.",
        "causes": "Prolonged leaf wetness (>9 hours) with moderate spring temperatures (13–24°C).",
        "recommendations": [
            "Apply protective fungicide spray of Captan 50% WP (2.5 g/L) or Difenoconazole 25% EC (0.5 ml/L) at bud break and petal fall.",
            "Rake and destroy fallen overwintered leaves beneath the tree canopy to reduce primary ascospore inoculum.",
            "Prune inner canopy branches annually to improve solar penetration and rapid morning drying."
        ]
    },
    "Apple___Black_rot": {
        "crop": "Apple",
        "scientific_name": "Malus domestica",
        "plant_family": "Rosaceae",
        "condition": "Black Rot (Frogeye Leaf Spot)",
        "pathogen": "Botryosphaeria obtusa",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Circular purple spots on leaves expanding into 'frogeye' lesions with light brown centers and dark purple concentric borders.",
        "causes": "Fungal spores splashed by rain from infected dead wood, twigs, and mummified fruit left on trees.",
        "recommendations": [
            "Foliar spray of Thiophanate-Methyl 70% WP at 1 g/L or Mancozeb 75% WP at 2.5 g/L.",
            "Prune out all dead twigs, fire blight strikes, and cankers 15 cm below visible infection margins.",
            "Remove all mummified apples from trees and orchard floor during dormant winter pruning."
        ]
    },
    "Apple___Cedar_apple_rust": {
        "crop": "Apple",
        "scientific_name": "Malus domestica",
        "plant_family": "Rosaceae",
        "condition": "Cedar Apple Rust",
        "pathogen": "Gymnosporangium juniperi-virginianae",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Vibrant orange-yellow circular spots with dark center specks on upper leaf surfaces and cup-like aecia structures beneath.",
        "causes": "Heteroecious rust fungus requiring both Eastern Red Cedar / Juniper and Apple trees within 1–2 km.",
        "recommendations": [
            "Spray Myclobutanil 10% WP at 1 g/L or Tebuconazole 25.9% EC at 0.75 ml/L from pink bud through petal fall.",
            "Eradicate or prune galls from adjacent Juniper / Red Cedar hosts within 500 meters of the orchard.",
            "Plant resistant apple cultivars (e.g. Liberty, Enterprise, Freedom) in high-pressure rust regions."
        ]
    },
    "Apple___healthy": {
        "crop": "Apple",
        "scientific_name": "Malus domestica",
        "plant_family": "Rosaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Crisp, deep green leaves with serrated margins, clear reticulate venation, and zero foliar lesioning.",
        "causes": "Optimal soil nutrition, balanced dormant spray program, and absence of fungal pathogens.",
        "recommendations": [
            "Maintain preventive dormant copper spray during late winter before bud swell.",
            "Monitor tree canopy for early mite or aphid colonies using hand lens.",
            "Ensure balanced potassium and boron foliar nutrition during fruit cell division."
        ]
    },

    # ---------------- Blueberry ----------------
    "Blueberry___healthy": {
        "crop": "Blueberry",
        "scientific_name": "Vaccinium corymbosum",
        "plant_family": "Ericaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Glossy, uniform oval dark green leaves with clean petioles and vigorous vegetative growth.",
        "causes": "Acidic soil microclimate (pH 4.5–5.2) with steady drip irrigation and pine-bark mulch.",
        "recommendations": [
            "Maintain soil pH between 4.5 and 5.2 using elemental sulfur applications if necessary.",
            "Maintain 8–10 cm organic pine needle or wood-chip mulch to protect shallow fibrous roots.",
            "Provide regular drip irrigation to avoid foliar drought stress during berry expansion."
        ]
    },

    # ---------------- Cherry ----------------
    "Cherry_(including_sour)___Powdery_mildew": {
        "crop": "Cherry",
        "scientific_name": "Prunus cerasus",
        "plant_family": "Rosaceae",
        "condition": "Powdery Mildew",
        "pathogen": "Podosphaera clandestina",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "White to grayish powdery fungal patches on young terminal leaves leading to upward curling and leaf distortion.",
        "causes": "High relative humidity in dense canopies with warm dry days (18–27°C) and shaded foliage.",
        "recommendations": [
            "Apply Wettable Sulfur 80% WP at 3 g/L or Azoxystrobin 23% SC at 1 ml/L at first sign of white mold.",
            "Avoid excessive late-season nitrogen fertilization which induces tender susceptible flushes.",
            "Prune shoots to open canopy centers and maximize airflow through the crown."
        ]
    },
    "Cherry_(including_sour)___healthy": {
        "crop": "Cherry",
        "scientific_name": "Prunus cerasus",
        "plant_family": "Rosaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Vibrant emerald green leaves with prominent veins and clean serrated margins free of spots.",
        "causes": "Adequate winter chilling hours, balanced fertility, and clean orchard hygiene.",
        "recommendations": [
            "Conduct routine scouting for cherry fruit fly and leaf miner damage.",
            "Maintain summer canopy pruning after harvest to encourage strong bud differentiation."
        ]
    },

    # ---------------- Corn / Maize ----------------
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "crop": "Corn (Maize)",
        "scientific_name": "Zea mays",
        "plant_family": "Poaceae",
        "condition": "Gray Leaf Spot",
        "pathogen": "Cercospora zeae-maydis",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Rectangular, tan to gray lesions with distinct parallel margins bounded strictly by leaf veins.",
        "causes": "Warm, humid conditions (>90% RH for 12+ hours) combined with minimum-till residue retention.",
        "recommendations": [
            "Apply Azoxystrobin (18.2%) + Difenoconazole (11.4%) SC at 1 ml/L or Pyraclostrobin 20% WG at 1 g/L at early tassel (VT-R1).",
            "Implement minimum 2-year crop rotation with non-grass crops (soybean, chickpea, cotton).",
            "Incorporate crop residue post-harvest with deep tillage to accelerate fungal decomposition."
        ]
    },
    "Corn_(maize)___Common_rust_": {
        "crop": "Corn (Maize)",
        "scientific_name": "Zea mays",
        "plant_family": "Poaceae",
        "condition": "Common Rust",
        "pathogen": "Puccinia sorghi",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Cinnamon-brown to golden-orange powdery pustules scattered across both upper and lower leaf surfaces.",
        "causes": "Moderate temperatures (16–25°C) and prolonged dew (>6 hours) carrying airborne urediniospores.",
        "recommendations": [
            "Foliar spray of Propiconazole 25% EC at 1 ml/L or Mancozeb 75% WP at 2.5 g/L upon pustule emergence.",
            "Plant rust-resistant certified hybrid varieties with Rp gene resistance.",
            "Avoid late-season dense plantings that trap high microclimate humidity."
        ]
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "crop": "Corn (Maize)",
        "scientific_name": "Zea mays",
        "plant_family": "Poaceae",
        "condition": "Northern Leaf Blight",
        "pathogen": "Exserohilum turcicum",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Cigar-shaped, long elliptical grayish-green or tan lesions (2.5–15 cm) parallel to leaf margins.",
        "causes": "Cool to moderate temperatures (18–27°C) with persistent foliar moisture.",
        "recommendations": [
            "Foliar spray of Mancozeb 75% WP at 2.5 g/L or Azoxystrobin 23% SC at 1 ml/L.",
            "Deep plow infected maize stubble to bury overwintering chlamydospores.",
            "Practice balanced nitrogen and potassium fertilization to reinforce leaf cell walls."
        ]
    },
    "Corn_(maize)___healthy": {
        "crop": "Corn (Maize)",
        "scientific_name": "Zea mays",
        "plant_family": "Poaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Sturdy, broad linear leaf blades of deep green hue with prominent midrib and active photosynthetic tissue.",
        "causes": "Balanced NPK fertility, adequate root moisture, and absence of foliar pathogens.",
        "recommendations": [
            "Execute scheduled split nitrogen application at V6 and knee-high stages.",
            "Ensure regular canopy moisture monitoring during silking and grain-filling."
        ]
    },

    # ---------------- Grape ----------------
    "Grape___Black_rot": {
        "crop": "Grape",
        "scientific_name": "Vitis vinifera",
        "plant_family": "Vitaceae",
        "condition": "Black Rot",
        "pathogen": "Guignardia bidwellii",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Small, circular reddish-brown leaf spots with dark margins developing tiny black pycnidia specks arranged in rings.",
        "causes": "Warm, humid spring weather (21–27°C) with rain-splash dissemination from overwintered mummies.",
        "recommendations": [
            "Spray Mancozeb 75% WP at 2.5 g/L or Myclobutanil 10% WP at 1 g/L starting at 2-inch shoot stage through post-bloom.",
            "Prune out mummified berry clusters, dead canes, and cankers during winter dormant pruning.",
            "Trellis vines to elevate foliage and maintain canopy ventilation."
        ]
    },
    "Grape___Esca_(Black_Measles)": {
        "crop": "Grape",
        "scientific_name": "Vitis vinifera",
        "plant_family": "Vitaceae",
        "condition": "Esca (Black Measles / Grape Trunk Disease)",
        "pathogen": "Phaeomoniella chlamydospora & Fomitiporia mediterranea",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Interveinal chlorosis and necrosis creating distinctive 'tiger-stripe' patterns on mature vine foliage.",
        "causes": "Vascular wood-decay fungi invading through pruning wounds and colonizing vascular cambium.",
        "recommendations": [
            "Paint all large winter pruning cuts immediately with pruning wound sealant or Trichoderma bio-paste.",
            "Avoid making pruning wounds during wet or humid conditions.",
            "Mark severely stunted vines for double-pruning or trunk renewal."
        ]
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "crop": "Grape",
        "scientific_name": "Vitis vinifera",
        "plant_family": "Vitaceae",
        "condition": "Leaf Blight (Isariopsis Leaf Spot)",
        "pathogen": "Pseudocercospora vitis (Isariopsis clavispora)",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Large, irregular brown necrotic lesions with dark borders on older leaves, often causing premature leaf drop.",
        "causes": "Warm, humid post-monsoon or late summer conditions on mature dense canopies.",
        "recommendations": [
            "Spray Copper Oxychloride 50% WP at 2.5 g/L or Difenoconazole 25% EC at 0.5 ml/L.",
            "Remove and destroy severely blighted lower canopy leaves touching the ground.",
            "Maintain canopy shoot-thinning to enhance airflow around grape clusters."
        ]
    },
    "Grape___healthy": {
        "crop": "Grape",
        "scientific_name": "Vitis vinifera",
        "plant_family": "Vitaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Crisp, palmate lobed leaves of vivid green color with clear venation and no discoloration or chlorosis.",
        "causes": "Balanced vine nutrition, drip fertigation, and proactive preventive canopy management.",
        "recommendations": [
            "Maintain preventive protective spray schedule prior to monsoon spells.",
            "Ensure regular shoot positioning and sucker removal along the cordon wire."
        ]
    },

    # ---------------- Orange / Citrus ----------------
    "Orange___Haunglongbing_(Citrus_greening)": {
        "crop": "Citrus (Orange)",
        "scientific_name": "Citrus sinensis",
        "plant_family": "Rutaceae",
        "condition": "Citrus Greening (Huanglongbing / HLB)",
        "pathogen": "Candidatus Liberibacter asiaticus",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Asymmetric blotchy foliar mottle crossing leaf veins, yellowing of shoots, thickened corky leaf veins, and stunted fruit.",
        "causes": "Bacterial phloem colonization transmitted by the Asian Citrus Psyllid (Diaphorina citri).",
        "recommendations": [
            "Tier 1 (Vector Control): Immediately spray Imidacloprid 17.8% SL at 0.5 ml/L or Thiamethoxam 25% WG at 0.3 g/L to suppress psyllids.",
            "Tier 2 (Sanitation): Completely remove and incinerate severely infected trees to eliminate bacterial reservoir.",
            "Tier 3 (Nutrition): Apply foliar micronutrient sprays (zinc, manganese, iron, boron) to relieve phloem stress in neighboring groves."
        ]
    },

    # ---------------- Peach ----------------
    "Peach___Bacterial_spot": {
        "crop": "Peach",
        "scientific_name": "Prunus persica",
        "plant_family": "Rosaceae",
        "condition": "Bacterial Spot",
        "pathogen": "Xanthomonas arboricola pv. pruni",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Small, angular purple-black water-soaked spots that drop out, leaving a 'shot-hole' appearance.",
        "causes": "Splashing rains, windy storms, and warm temperatures (21–29°C) on sandy orchard soils.",
        "recommendations": [
            "Apply Copper Hydroxide (53.8% DF) at 2 g/L during early spring dormancy and bud break.",
            "Avoid overhead sprinkler irrigation that keeps leaves moist.",
            "Maintain balanced nitrogen to prevent excessive soft vegetative growth."
        ]
    },
    "Peach___healthy": {
        "crop": "Peach",
        "scientific_name": "Prunus persica",
        "plant_family": "Rosaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Glossy, lanceolate vibrant green leaves with finely serrated margins and no shot-hole lesions.",
        "causes": "Optimal soil aeration, disease-free nursery stock, and appropriate dormant wash.",
        "recommendations": [
            "Scout regularly for peach tree borer and leaf curl symptoms.",
            "Maintain annual open-center pruning to maximize fruit sunlight exposure."
        ]
    },

    # ---------------- Pepper (Bell) / Chili ----------------
    "Pepper,_bell___Bacterial_spot": {
        "crop": "Pepper (Bell)",
        "scientific_name": "Capsicum annuum",
        "plant_family": "Solanaceae",
        "condition": "Bacterial Spot",
        "pathogen": "Xanthomonas campestris pv. vesicatoria",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Small, water-soaked, blister-like spots enlarging into brown angular lesions with chlorotic yellow halos.",
        "causes": "Splashing rain, warm humid weather (24–30°C), and infected seed or transplant stocks.",
        "recommendations": [
            "Foliar spray of Copper Hydroxide (53.8% DF) at 2 g/L tank-mixed with Mancozeb 75% WP at 2 g/L.",
            "Avoid working in field rows while foliage is wet from rain or dew.",
            "Use certified disease-free treated seed stock and drip irrigation exclusively."
        ]
    },
    "Pepper,_bell___healthy": {
        "crop": "Pepper (Bell)",
        "scientific_name": "Capsicum annuum",
        "plant_family": "Solanaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Smooth, glossy, rich green leaves without necrotic flecks, curling, or chlorosis.",
        "causes": "Balanced soil nutrient profile, proper drainage, and clean field microclimate.",
        "recommendations": [
            "Maintain scheduled drip irrigation without soil waterlogging.",
            "Install yellow sticky traps (15 per acre) to monitor vector thrips and aphids.",
            "Apply balanced micronutrient foliar spray (zinc, boron) before flowering flush."
        ]
    },

    # ---------------- Potato ----------------
    "Potato___Early_blight": {
        "crop": "Potato",
        "scientific_name": "Solanum tuberosum",
        "plant_family": "Solanaceae",
        "condition": "Early Blight",
        "pathogen": "Alternaria solani",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Brown to black circular necrotic spots displaying characteristic concentric 'target board' rings on older leaves.",
        "causes": "Alternating wet and dry weather cycles with plant stress or declining nitrogen availability.",
        "recommendations": [
            "Spray Chlorothalonil 75% WP at 2 g/L or Azoxystrobin 23% SC at 1 ml/L at first appearance of target spots.",
            "Prune and destroy severely infected lower leaves touching the soil surface.",
            "Avoid overhead irrigation to minimize the duration of leaf wetness."
        ]
    },
    "Potato___Late_blight": {
        "crop": "Potato",
        "scientific_name": "Solanum tuberosum",
        "plant_family": "Solanaceae",
        "condition": "Late Blight",
        "pathogen": "Phytophthora infestans",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Rapidly expanding water-soaked dark lesions on leaves and stems with white cottony fungal growth on undersides.",
        "causes": "Cool (10–20°C), overcast, and persistently wet conditions with relative humidity > 90%.",
        "recommendations": [
            "Immediate systemic application of Metalaxyl-M (4%) + Mancozeb (64%) WP at 2.5 g/L or Dimethomorph 50% WP at 1 g/L.",
            "Burn or deeply bury severely blighted haulms immediately to stop airborne sporangia transmission.",
            "Do not harvest tubers from fields with active late-blight haulms; dehaulm 10 days before digging."
        ]
    },
    "Potato___healthy": {
        "crop": "Potato",
        "scientific_name": "Solanum tuberosum",
        "plant_family": "Solanaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Lush, spreading potato foliage with crisp dark green pinnate leaflets and sturdy stems.",
        "causes": "Certified tuber seeds, disease-free soil, and controlled agro-climatic conditions.",
        "recommendations": [
            "Perform timely earthing-up (hilling) to cover developing tubers from sunlight and blight spores.",
            "Maintain preventive protective fungicide cover (Mancozeb 75% WP at 2 g/L) during overcast spells."
        ]
    },

    # ---------------- Raspberry ----------------
    "Raspberry___healthy": {
        "crop": "Raspberry",
        "scientific_name": "Rubus idaeus",
        "plant_family": "Rosaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Compound leaves with 3 to 5 sharply serrated leaflets, light green undersides, and robust cane vigor.",
        "causes": "Well-drained acidic soil, cane trellising, and clean certified planting rootstock.",
        "recommendations": [
            "Trellis primocanes and floricanes neatly to ensure maximum airflow.",
            "Remove spent floricanes immediately after fruiting to prevent cane blight."
        ]
    },

    # ---------------- Soybean ----------------
    "Soybean___healthy": {
        "crop": "Soybean",
        "scientific_name": "Glycine max",
        "plant_family": "Fabaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Trifoliate ovate leaves of rich dark green with clean veins and active nitrogen-fixing nodulation.",
        "causes": "Inoculated Bradyrhizobium seed treatment, balanced phosphorus, and weed-free field.",
        "recommendations": [
            "Monitor root nodules to ensure active nitrogen fixation (pink-red interior).",
            "Scout for early rust or defoliating caterpillar infestations at R1-R3 stages."
        ]
    },

    # ---------------- Squash ----------------
    "Squash___Powdery_mildew": {
        "crop": "Squash",
        "scientific_name": "Cucurbita pepo",
        "plant_family": "Cucurbitaceae",
        "condition": "Powdery Mildew",
        "pathogen": "Podosphaera xanthii",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Dense white talcum-like talc fungal coating spreading over upper leaf surfaces, causing premature senescence.",
        "causes": "Dense plant canopies with dry foliage, high ambient relative humidity, and warm weather (22–30°C).",
        "recommendations": [
            "Foliar spray of Potassium Bicarbonate (4 g/L) or Azoxystrobin 23% SC at 1 ml/L or Difenoconazole 25% EC at 0.5 ml/L.",
            "Apply cold-pressed Neem oil (10,000 ppm) at 3 ml/L as an organic preventative.",
            "Space hills at least 1.5 meters apart to promote canopy ventilation and sunlight exposure."
        ]
    },

    # ---------------- Strawberry ----------------
    "Strawberry___Leaf_scorch": {
        "crop": "Strawberry",
        "scientific_name": "Fragaria × ananassa",
        "plant_family": "Rosaceae",
        "condition": "Leaf Scorch",
        "pathogen": "Diplocarpon earlianum",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Irregular purple to dark brown blotches coalescing across leaves, giving foliage a scorched, burnt appearance.",
        "causes": "Persistent leaf wetness from frequent rain or overhead sprinkler irrigation.",
        "recommendations": [
            "Apply Captan 50% WP at 2 g/L or Azoxystrobin 23% SC at 1 ml/L.",
            "Remove and destroy severely scorched outer leaves during runner maintenance.",
            "Utilize raised plastic-mulched beds with drip lines to keep strawberry crowns dry."
        ]
    },
    "Strawberry___healthy": {
        "crop": "Strawberry",
        "scientific_name": "Fragaria × ananassa",
        "plant_family": "Rosaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Vibrant trifoliate dark green leaves with clean petioles, strong crown development, and no leaf spots.",
        "causes": "Raised bed mulch culture, drip fertigation, and certified clean runner stock.",
        "recommendations": [
            "Maintain strawberry bed mulch to prevent fruit soil contact.",
            "Monitor crown moisture to prevent root rots during early fruit set."
        ]
    },

    # ---------------- Tomato ----------------
    "Tomato___Bacterial_spot": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Bacterial Spot",
        "pathogen": "Xanthomonas perforans",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Small, dark brown angular spots with translucent water-soaked borders that become dry and papery.",
        "causes": "Warm, stormy weather with driving rains that drive bacterial cells through stomata and wounds.",
        "recommendations": [
            "Foliar spray of Copper Oxychloride 50% WP at 2.5 g/L combined with Streptocycline (100 ppm) at 1 g/10 L.",
            "Use organic straw or plastic mulch to suppress rain-splash transmission from soil to foliage.",
            "Avoid overhead irrigation; prune suckers only during hot, dry midday conditions."
        ]
    },
    "Tomato___Early_blight": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Early Blight",
        "pathogen": "Alternaria linariae / Alternaria solani",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Dark brown circular spots with distinctive concentric target rings surrounded by a yellow chlorotic halo.",
        "causes": "Frequent rainfall or heavy dew combined with warm temperatures (24–29°C) on aging lower foliage.",
        "recommendations": [
            "Spray Difenoconazole 25% EC at 0.5 ml/L or Azoxystrobin (18.2%) + Difenoconazole (11.4%) SC at 1 ml/L.",
            "Prune off bottom 30 cm of foliage to improve ventilation and prevent soil-borne splash-back.",
            "Mulch root beds with 5 cm clean organic straw and rotate with non-solanaceous crops."
        ]
    },
    "Tomato___Late_blight": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Late Blight",
        "pathogen": "Phytophthora infestans",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Large, irregular, water-soaked oily spots turning dark brown with white downy spore mildew under high humidity.",
        "causes": "Cool, fog-laden, overcast weather (15–22°C) with persistent leaf wetness.",
        "recommendations": [
            "Urgent treatment with Cymoxanil 8% + Mancozeb 64% WP at 2.5 g/L or Dimethomorph 50% WP at 1 g/L.",
            "Immediately remove and bag all infected stems, leaves, and fruit clusters before spores disperse.",
            "Strictly switch from overhead sprinklers to root drip irrigation to keep canopy dry."
        ]
    },
    "Tomato___Leaf_Mold": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Leaf Mold",
        "pathogen": "Passalora fulva",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Pale greenish-yellow chlorotic patches on upper leaf surface corresponding to velvety olive-brown mold on undersides.",
        "causes": "High greenhouse or high-tunnel humidity (>85%) with moderate temperatures (21–24°C).",
        "recommendations": [
            "Spray Copper Hydroxide (53.8% DF) at 2 g/L or Difenoconazole 25% EC at 0.5 ml/L.",
            "Increase greenhouse ventilation fans and roll up sidewalls to reduce relative humidity below 80%.",
            "Increase plant spacing to at least 45–60 cm within rows."
        ]
    },
    "Tomato___Septoria_leaf_spot": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Septoria Leaf Spot",
        "pathogen": "Septoria lycopersici",
        "severity": "MODERATE",
        "is_healthy": False,
        "symptoms": "Numerous small (2–3 mm), circular spots with dark brown margins and gray centers containing tiny black pycnidia specks.",
        "causes": "Warm, wet periods with rain splashing pycnidiospores from plant debris to lower foliage.",
        "recommendations": [
            "Apply Chlorothalonil 75% WP at 2 g/L or Mancozeb 75% WP at 2.5 g/L on a 7–10 day protective schedule.",
            "Strip off and discard lower infected leaves as soon as circular gray-center specks appear.",
            "Stake and trellis vines to elevate foliage from moist soil."
        ]
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Spider Mites (Two-Spotted Spider Mite)",
        "pathogen": "Tetranychus urticae",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Dense yellow or bronze stippling on leaf surfaces with fine silky webbing visible on the undersides.",
        "causes": "Hot, dry, and dusty microclimate conditions (temperatures > 30°C and low humidity).",
        "recommendations": [
            "Foliar spray of Spiromesifen 22.9% SC at 1 ml/L or Abamectin 1.9% EC at 0.5 ml/L.",
            "Release predatory mites (Phytoseiulus persimilis) in enclosed polyhouses.",
            "Spray plants with fine water mist on foliage undersides to disrupt dry mite habitats."
        ]
    },
    "Tomato___Target_Spot": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Target Spot",
        "pathogen": "Corynespora cassiicola",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Small pinpoint brown lesions expanding into circular spots with light brown centers, dark borders, and yellow halos.",
        "causes": "High humidity (continuous leaf wetness for 16+ hours) and warm tropical temperatures (28–32°C).",
        "recommendations": [
            "Apply Azoxystrobin (18.2%) + Difenoconazole (11.4%) SC at 1 ml/L or Boscalid 50% WG at 0.5 g/L.",
            "Avoid excessive canopy vegetative density through selective side-shoot pruning.",
            "Avoid excessive nitrogen fertilization which promotes tender, susceptible foliage."
        ]
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "pathogen": "Begomovirus (TYLCV)",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Severe upward cupping and curling of leaflets, marginal chlorosis, stunted bushy stature, and flower drop.",
        "causes": "Vector transmission by Silverleaf Whitefly (Bemisia tabaci); virus cannot be cured once inside vascular system.",
        "recommendations": [
            "Vector Control: Foliar spray of Imidacloprid 17.8% SL at 0.3 ml/L or Thiamethoxam 25% WG at 0.3 g/L.",
            "Install 20–25 yellow sticky traps per acre at canopy level to monitor and mass-trap adult whiteflies.",
            "Rogue out and incinerate stunted, yellow-curled plants immediately to prevent whiteflies transmitting virus to healthy vines."
        ]
    },
    "Tomato___Tomato_mosaic_virus": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Tomato Mosaic Virus (ToMV)",
        "pathogen": "Tobamovirus (ToMV)",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Mottled alternating light and dark green patterns on leaves, distortion into narrow 'shoestring' or 'fern-like' shapes.",
        "causes": "Mechanical transmission by contaminated hands, tools, grafting shears, and tobacco user contact.",
        "recommendations": [
            "Wash hands thoroughly with soap and water; dip pruning shears in 10% non-fat dry milk or 20% trisodium phosphate.",
            "Rogue out infected plants immediately and destroy; avoid smoking or using tobacco products inside tomato fields.",
            "Plant resistant tomato hybrid cultivars (bearing the Tm-2^2 resistance gene)."
        ]
    },
    "Tomato___healthy": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "plant_family": "Solanaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Vibrant, deep green foliage with sturdy petioles, healthy glandular trichomes, and active shoot elongation.",
        "causes": "Balanced fertility, proper drip irrigation, disease-free nursery seedlings, and preventive IPM.",
        "recommendations": [
            "Maintain consistent drip fertigation; apply calcium nitrate to prevent blossom end rot in developing fruits.",
            "Perform regular trellising, sucker removal, and canopy scouting twice weekly.",
            "Maintain preventive biocontrol root drench with Trichoderma viride (10 g/L) around root zone."
        ]
    },

    # ---------------- Extended Staple & Cash Crops ----------------
    "Rice___Blast": {
        "crop": "Rice (Paddy)",
        "scientific_name": "Oryza sativa",
        "plant_family": "Poaceae",
        "condition": "Rice Blast",
        "pathogen": "Magnaporthe oryzae (Pyricularia oryzae)",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Spindle-shaped or diamond-shaped lesions with gray/whitish centers and dark brown margins across leaf blades.",
        "causes": "High relative humidity (>90%), cool night temperatures (18–22°C), and excessive nitrogen fertilization.",
        "recommendations": [
            "Foliar spray of Tricyclazole 75% WP at 0.6 g/L or Isoprothiolane 40% EC at 1.5 ml/L at early tillering or boot stage.",
            "Avoid excessive split nitrogen application; maintain balanced potassium fertilization.",
            "Maintain continuous shallow flooding (3–5 cm) in paddies during vegetative stages to reduce plant stress."
        ]
    },
    "Rice___Brown_Spot": {
        "crop": "Rice (Paddy)",
        "scientific_name": "Oryza sativa",
        "plant_family": "Poaceae",
        "condition": "Rice Brown Spot",
        "pathogen": "Bipolaris oryzae",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Oval to circular brown spots with yellow halos evenly distributed over the leaf blade.",
        "causes": "Nutrient-depleted soils, silicon/potassium deficiency, and alternating dry and flooded conditions.",
        "recommendations": [
            "Foliar spray of Mancozeb 75% WP at 2.5 g/L or Propiconazole 25% EC at 1 ml/L.",
            "Apply balanced fertilizer with micronutrients and silicon slag to strengthen leaf cuticle.",
            "Treat seed before sowing with Carbendazim 50% WP at 2 g/kg seed."
        ]
    },
    "Rice___healthy": {
        "crop": "Rice (Paddy)",
        "scientific_name": "Oryza sativa",
        "plant_family": "Poaceae",
        "condition": "Healthy Foliage",
        "pathogen": "None (Non-pathogenic)",
        "severity": "LOW",
        "is_healthy": True,
        "symptoms": "Erect, vibrant green linear leaf blades with smooth margins and healthy tillering.",
        "causes": "Optimal water management, balanced NPK fertility, and disease-free certified paddy seed.",
        "recommendations": [
            "Maintain alternate wetting and drying (AWD) water management to conserve water and strengthen root anchorage.",
            "Monitor for stem borer and leaf folder moths at weekly intervals."
        ]
    },
    "Wheat___Rust": {
        "crop": "Wheat",
        "scientific_name": "Triticum aestivum",
        "plant_family": "Poaceae",
        "condition": "Stripe / Yellow Rust",
        "pathogen": "Puccinia striiformis",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Bright yellow to orange pustules arranged in narrow linear stripes along the leaf veins.",
        "causes": "Cool temperatures (10–15°C) with persistent winter fog or morning dew.",
        "recommendations": [
            "Immediate spray of Propiconazole 25% EC at 1 ml/L or Tebuconazole 25.9% EC at 1 ml/L.",
            "Sow certified rust-resistant wheat varieties recommended for your agro-ecological zone.",
            "Alert local agricultural extension officers (KVK) due to rapid wind-borne epidemic spread."
        ]
    },
    "Cotton___Leaf_Curl": {
        "crop": "Cotton",
        "scientific_name": "Gossypium hirsutum",
        "plant_family": "Malvaceae",
        "condition": "Cotton Leaf Curl Virus (CLCuV)",
        "pathogen": "Begomovirus (CLCuD)",
        "severity": "CRITICAL",
        "is_healthy": False,
        "symptoms": "Upward or downward leaf curling, vein thickening, leaf enations (leaf-like outgrowths beneath), and stunting.",
        "causes": "Transmitted by the whitefly vector (Bemisia tabaci).",
        "recommendations": [
            "Vector management: Spray Diafenthiuron 50% WP at 1.2 g/L or Flonicamid 50% WG at 0.4 g/L.",
            "Install yellow sticky traps (20 per acre) across cotton fields.",
            "Rogue out and destroy infected cotton seedlings during the first 45 days after sowing."
        ]
    },
    "Mango___Anthracnose": {
        "crop": "Mango",
        "scientific_name": "Mangifera indica",
        "plant_family": "Anacardiaceae",
        "condition": "Anthracnose",
        "pathogen": "Colletotrichum gloeosporioides",
        "severity": "HIGH",
        "is_healthy": False,
        "symptoms": "Irregular dark brown or black necrotic lesions on young flushes and leaves, causing leaf tear and shot-holes.",
        "causes": "Warm, humid conditions with splashing rain during new vegetative shoot emergence.",
        "recommendations": [
            "Spray Copper Oxychloride 50% WP at 3 g/L or Azoxystrobin 23% SC at 1 ml/L upon new vegetative flush emergence.",
            "Prune overcrowded center branches post-harvest to increase sun penetration.",
            "Collect and burn fallen infested leaves and twigs."
        ]
    }
}


def verify_plant_foliage(img: Image.Image) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Biological Foliage Gate:
    Validates whether the uploaded photograph contains biological plant foliage / leaf tissue.
    Rejects non-plant objects (electronics, faces, furniture, grayscale documents, blue skies, screens).
    """
    arr = np.array(img.convert("RGB"), dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    total_pixels = float(arr.shape[0] * arr.shape[1])

    mean_brightness = float(np.mean(arr))
    if mean_brightness < 10.0:
        return False, "Photograph is pitch black / severely underexposed.", {"foliar_ratio": 0.0}
    if mean_brightness > 248.0:
        return False, "Photograph is completely washed out / overexposed white.", {"foliar_ratio": 0.0}

    # Grayscale / Monochrome test
    color_diff = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    monochrome_mask = color_diff < 16.0
    monochrome_ratio = float(np.sum(monochrome_mask)) / total_pixels

    # Chlorophyll & Foliar Pigment Masks:
    # 1. Green chlorophyll foliage (G dominant over R and B)
    green_foliage = (g > r + 8.0) & (g > b + 8.0)
    # 2. Chlorotic yellow foliar tissue (R and G high, B low)
    yellow_chlorotic = (r > 85) & (g > 80) & (b < 100) & (np.abs(r - g) < 50)
    # 3. Necrotic brown foliar tissue (R > G > B with warm organic hues)
    brown_necrotic = (r > 55) & (g > 35) & (b < 70) & (r >= g) & (g > b)

    foliar_mask = green_foliage | yellow_chlorotic | brown_necrotic
    foliar_ratio = float(np.sum(foliar_mask)) / total_pixels

    # Reject if overwhelmingly monochrome/synthetic with virtually no plant tissue
    if monochrome_ratio > 0.88 and foliar_ratio < 0.05:
        return False, "Image appears to be monochrome, text, or a synthetic gray surface rather than live plant foliage.", {
            "monochrome_ratio": round(monochrome_ratio, 3),
            "foliar_ratio": round(foliar_ratio, 3)
        }

    # Reject if no characteristic foliar pigments are detected (< 4% of pixels)
    if foliar_ratio < 0.04:
        return False, "No characteristic crop foliage or leaf blade tissue detected in the photograph.", {
            "foliar_ratio": round(foliar_ratio, 3)
        }

    return True, "Valid foliar photograph", {
        "foliar_ratio": round(foliar_ratio, 3),
        "monochrome_ratio": round(monochrome_ratio, 3)
    }


def get_local_vision_model():
    """
    Lazy-load pre-trained 38-class ResNet-50 Deep Vision model.
    """
    global _LOCAL_MODEL, _LOCAL_TRANSFORM, _LOCAL_ID2LABEL, _LOCAL_ENGINE_NAME

    _load_torch_deps()
    if _LOCAL_MODEL is None and HAS_TORCH:
        device = torch.device("cpu")

        # 1. Try loading fine-tuned 38-class ResNet-50 from local cache first
        if HAS_TRANSFORMERS:
            try:
                model = AutoModelForImageClassification.from_pretrained(HF_MODEL_ID, local_files_only=True)
                model.eval()
                _LOCAL_MODEL = model
                _LOCAL_ID2LABEL = {int(k): v for k, v in model.config.id2label.items()}
                _LOCAL_ENGINE_NAME = "PyTorch ResNet-50 Deep CNN (38-Class PlantVillage Benchmark)"
                logger.info("Successfully loaded 38-class PlantVillage ResNet-50 model from local cache.")
            except Exception as e:
                logger.info(f"Local HuggingFace cache not found: {e}. Checking local checkpoint...")

        # 2. Fallback to local checkpoint if HuggingFace model failed
        if _LOCAL_MODEL is None and RESNET50_MODEL_PATH.exists():
            try:
                checkpoint = torch.load(RESNET50_MODEL_PATH, map_location=device)
                num_classes = checkpoint.get("num_classes", 16)
                model = models.resnet50(weights=None)
                in_features = model.fc.in_features
                model.fc = nn.Sequential(
                    nn.Linear(in_features, 512),
                    nn.BatchNorm1d(512),
                    nn.ReLU(),
                    nn.Dropout(p=0.3),
                    nn.Linear(512, num_classes)
                )
                model.load_state_dict(checkpoint["state_dict"])
                model.eval()
                _LOCAL_MODEL = model
                classes_list = checkpoint.get("classes", list(DISEASE_CATALOG.keys())[:16])
                _LOCAL_ID2LABEL = {i: c for i, c in enumerate(classes_list)}
                _LOCAL_ENGINE_NAME = "PyTorch ResNet-50 Super Model (Local Checkpoint)"
            except Exception as e:
                logger.error(f"Failed to load local ResNet-50: {e}")

        # Normalization transform
        _LOCAL_TRANSFORM = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    return _LOCAL_MODEL, _LOCAL_TRANSFORM, _LOCAL_ID2LABEL, _LOCAL_ENGINE_NAME


async def predict_with_universal_gemini_vision(
    image_bytes: bytes,
    crop_hint: Optional[str],
    api_key: str
) -> Optional[Dict[str, Any]]:
    """
    Calls Google Gemini Multimodal Vision API to identify ANY plant in the world (300,000+ species)
    and diagnose any foliar pathology with comprehensive treatments.
    """
    if not api_key or not api_key.strip():
        return None

    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    crop_context_note = f"The farmer provided the crop hint: '{crop_hint}'." if (crop_hint and crop_hint.lower() not in ["auto", "all", "unknown"]) else "No specific crop hint was provided; perform open-world plant identification."

    prompt = (
        "You are an expert senior agricultural plant pathologist and botanist.\n"
        "Analyze this crop / plant leaf photograph with scientific diagnostic accuracy.\n"
        f"{crop_context_note}\n\n"
        "Strict Instructions:\n"
        "1. First verify if this photograph contains botanical plant foliage (leaf, plant shoot, or flower). "
        "If it is a human, animal, electronic device, room, document, or non-plant object, set is_plant=false and prediction_allowed=false.\n"
        "2. Accurately identify the common plant/crop name (e.g. Rice, Wheat, Cotton, Mango, Neem, Rose, Guava, Papaya, Banana, Corn, Potato, Tomato, Pepper, Apple, Grape, Citrus, etc.). Do NOT assume Tomato unless it is truly Solanum lycopersicum.\n"
        "3. Identify the botanical scientific name (e.g., Oryza sativa, Mangifera indica) and botanical family.\n"
        "4. Identify the pathological condition: is it healthy, or what specific fungal, bacterial, viral, pest, or abiotic nutritional disorder is present?\n"
        "5. Provide the exact pathogen scientific name or 'None' if healthy/abiotic.\n"
        "6. Provide severity rating (LOW, MODERATE, HIGH, CRITICAL), detailed observed symptoms, and primary causes.\n"
        "7. Provide 3 actionable recommendations:\n"
        "   - Tier 1 (Chemical): Specific chemical fungicide/bactericide/insecticide with active ingredient and exact dosage.\n"
        "   - Tier 2 (Biological / Organic): Organic bio-control agent or botanical extract (e.g., Neem oil, Trichoderma viride, Bacillus subtilis).\n"
        "   - Tier 3 (Cultural): Farm cultural management practices (sanitation, pruning, drip irrigation, crop rotation).\n"
        "8. Return realistic confidence (0.0 to 1.0) and top_predictions.\n\n"
        "Respond ONLY with a valid JSON object matching this schema (no markdown fences, no explanatory text outside the JSON):\n"
        "{\n"
        '  "is_plant": true,\n'
        '  "prediction_allowed": true,\n'
        '  "crop": "Common Plant Name",\n'
        '  "scientific_name": "Botanical Latin Name",\n'
        '  "plant_family": "Botanical Family",\n'
        '  "disease": "Specific Disease Name or Healthy Foliage",\n'
        '  "is_healthy": false,\n'
        '  "pathogen": "Pathogen Scientific Name or None",\n'
        '  "severity": "MODERATE",\n'
        '  "confidence": 0.95,\n'
        '  "symptoms": "Detailed visual symptoms observed on leaf blade, margins, or veins",\n'
        '  "causes": "Environmental, microclimatic, or vector causes",\n'
        '  "recommendations": ["Tier 1: ...", "Tier 2: ...", "Tier 3: ..."],\n'
        '  "top_predictions": [\n'
        '    {"crop": "...", "disease": "...", "probability": 95.0, "is_healthy": false}\n'
        '  ]\n'
        "}"
    )

    models_to_try = [
        "gemini-2.5-flash",
        "gemini-3.6-flash",
        "gemini-2.5-pro",
        "gemini-3.7-flash",
    ]

    async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": b64_image
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.1,
                    "response_mime_type": "application/json"
                }
            }

            try:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    resp_json = response.json()
                    candidates = resp_json.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            raw_text = parts[0]["text"].strip()
                            # Robust JSON extraction from raw response
                            s_idx = raw_text.find("{")
                            e_idx = raw_text.rfind("}")
                            if s_idx != -1 and e_idx != -1 and e_idx > s_idx:
                                json_str = raw_text[s_idx:e_idx + 1]
                            else:
                                json_str = raw_text
                            parsed = json.loads(json_str)
                            parsed["api_engine_used"] = f"Google Gemini ({model_name}) Multimodal Vision API"
                            parsed["engine_type"] = "UNIVERSAL_API"
                            return parsed
                else:
                    logger.warning(f"Gemini API ({model_name}) returned status {response.status_code}: {response.text[:200]}")
            except Exception as e:
                logger.warning(f"Error invoking Gemini API ({model_name}): {e}")
                continue

    return None


class DiseaseService:
    """Production service for universal open-world plant pathology and deep CNN vision intelligence."""

    def get_supported_classes(self) -> Dict[str, Any]:
        """Returns supported crops, diseases, and dual-engine capabilities."""
        classes_list = list(DISEASE_CATALOG.keys())
        supported_crops = sorted(list(set([cls.split("___")[0].replace("_", " ").strip() for cls in classes_list if "___" in cls] + ["Tomato", "Potato", "Corn (maize)", "Pepper (bell)", "Rice", "Wheat", "Cotton"])))

        return {
            "model_version": "UNIVERSAL_DISEASE_v2.5",
            "disease_model_version": "UNIVERSAL_DISEASE_v2.5",
            "model_status": "VALIDATED_PRODUCTION",
            "disease_model_status": "VALIDATED_PRODUCTION",
            "deployment_status": "PRODUCTION",
            "supported_crops": supported_crops,
            "supported_crops_count": "Universal (300,000+ botanical species via Gemini Vision) / 16+ core crops via Local ResNet-50",
            "supported_classes_count": len(classes_list),
            "classes": classes_list,
            "engine_info": {
                "universal_engine": "Google Gemini (2.5 & 3.6 Flash) Multimodal Vision API (Universal Any-Plant Pathology AI)",
                "local_engine": _LOCAL_ENGINE_NAME
            },
            "disclaimer": "Diagnostic results provide decision support for growers. For critical outbreaks, consult a certified local agronomist."
        }

    async def predict_disease_from_upload(
        self,
        user_id: str,
        file: UploadFile,
        crop_hint: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Validate file extension
        ext = Path(file.filename).suffix.lower() if file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file extension '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP."
            )

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds maximum allowed upload size of 10 MB."
            )

        # 2. Parse Image
        try:
            img = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "prediction_allowed": False,
                    "status": "IMAGE_INSUFFICIENT_FOR_ANALYSIS",
                    "message": "Image file is corrupted or unreadable. Please upload a clear JPG/PNG crop photograph."
                }
            )

        # 2b. Quality & Resolution Check
        if img.width < 32 or img.height < 32:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "prediction_allowed": False,
                    "status": "IMAGE_INSUFFICIENT_FOR_ANALYSIS",
                    "message": "Image resolution is too low (< 32x32). Please upload a clear photograph of the crop leaf."
                }
            )

        arr = np.array(img)
        if arr.mean() < 6.0 or arr.std() < 2.0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "prediction_allowed": False,
                    "status": "IMAGE_INSUFFICIENT_FOR_ANALYSIS",
                    "message": "Image is blank, pitch black, or too uniform to perform foliar diagnosis."
                }
            )

        # 3. Stage-1 Biological Foliage Verification Gate
        is_plant, foliage_reason, metrics = verify_plant_foliage(img)
        pred_id = f"DIS-{uuid.uuid4().hex[:8].upper()}"
        img_id = f"img_{uuid.uuid4().hex[:8]}"
        now_str = datetime.now(timezone.utc).isoformat()

        if not is_plant:
            reject_res = {
                "prediction_allowed": False,
                "prediction_id": pred_id,
                "image_id": img_id,
                "image_url": None,
                "crop": "Non-Foliar / Unidentified Object",
                "scientific_name": "Non-botanical",
                "plant_family": "Non-botanical",
                "disease": "Non-Plant Photograph Detected",
                "pathogen": "None",
                "symptoms": foliage_reason,
                "causes": "The uploaded photograph does not contain characteristic leaf chloroplasts or plant tissue.",
                "possibleCauses": "The uploaded photograph does not contain characteristic leaf chloroplasts or plant tissue.",
                "confidence": 0.0,
                "model_confidence": 0.0,
                "confidence_pct": 0.0,
                "severity": "LOW",
                "status": "INVALID_IMAGE_NON_FOLIAGE",
                "is_plant": False,
                "rejection_reason": foliage_reason,
                "disease_model_status": "VALIDATED_PRODUCTION",
                "disease_model_version": "UNIVERSAL_DISEASE_v2.0",
                "model_status": "VALIDATED_PRODUCTION",
                "model_version": "UNIVERSAL_DISEASE_v2.0",
                "deployment_status": "PRODUCTION",
                "architecture": "Biological Foliage Gate",
                "api_engine_used": "Biological Foliage Verification Gate (Non-Plant Rejection)",
                "engine_type": "LOCAL_VERIFIER",
                "ai_prediction": True,
                "message": f"Non-Foliar Image Detected: {foliage_reason} Please upload a clear photograph of crop leaves.",
                "disclaimer": "The system screens out non-agricultural and non-plant photographs to prevent erroneous diagnoses.",
                "prediction_timestamp": now_str,
                "recommendations": [
                    "Photograph living plant foliage under natural daylight.",
                    "Ensure the leaf blade fills at least 50% of the frame.",
                    "Avoid photographing plain walls, computer screens, printed documents, or non-plant objects."
                ],
                "top_predictions": [],
                "created_at": now_str,
            }
            return reject_res

        # 4. Check for Universal Gemini Vision Engine
        effective_api_key = api_key or settings.GEMINI_API_KEY
        if effective_api_key:
            gemini_result = await predict_with_universal_gemini_vision(contents, crop_hint, effective_api_key)
            if gemini_result:
                if gemini_result.get("is_plant") is False or gemini_result.get("prediction_allowed") is False:
                    symptoms_text = gemini_result.get("symptoms", "The uploaded image does not appear to contain living botanical plant foliage.")
                    reject_res = {
                        "prediction_allowed": False,
                        "prediction_id": pred_id,
                        "image_id": img_id,
                        "image_url": None,
                        "crop": "Non-Foliar / Unidentified Object",
                        "scientific_name": "Non-botanical",
                        "plant_family": "Non-botanical",
                        "disease": "Non-Plant Photograph Detected",
                        "pathogen": "None",
                        "symptoms": symptoms_text,
                        "causes": "The uploaded photograph does not contain characteristic leaf chloroplasts or living plant tissue.",
                        "possibleCauses": "The uploaded photograph does not contain characteristic leaf chloroplasts or living plant tissue.",
                        "confidence": 0.0,
                        "model_confidence": 0.0,
                        "confidence_pct": 0.0,
                        "severity": "LOW",
                        "status": "INVALID_IMAGE_NON_FOLIAGE",
                        "is_plant": False,
                        "rejection_reason": symptoms_text,
                        "disease_model_status": "VALIDATED_PRODUCTION",
                        "disease_model_version": "UNIVERSAL_DISEASE_v2.0",
                        "model_status": "VALIDATED_PRODUCTION",
                        "model_version": "UNIVERSAL_DISEASE_v2.0",
                        "deployment_status": "PRODUCTION",
                        "architecture": "Google Gemini Multimodal Vision API",
                        "api_engine_used": gemini_result.get("api_engine_used", "Google Gemini Multimodal Vision API"),
                        "engine_type": "UNIVERSAL_API",
                        "ai_prediction": True,
                        "message": f"Non-Plant Detected: {symptoms_text}",
                        "disclaimer": "Diagnostic result screened by Google Gemini Multimodal Vision AI.",
                        "prediction_timestamp": now_str,
                        "recommendations": [
                            "Photograph living plant foliage under natural daylight.",
                            "Ensure the leaf blade fills at least 50% of the frame.",
                            "Avoid photographing plain walls, computer screens, printed documents, or non-plant objects."
                        ],
                        "top_predictions": [],
                        "created_at": now_str,
                    }
                    return reject_res

                # Format successful Universal Gemini result
                crop_name = gemini_result.get("crop", "Botanical Plant Specimen")
                sci_name = gemini_result.get("scientific_name", "")
                family_name = gemini_result.get("plant_family", "")
                disease_name = gemini_result.get("disease", "Healthy Foliage")
                is_healthy = gemini_result.get("is_healthy", False) or "healthy" in disease_name.lower()
                conf_val = float(gemini_result.get("confidence", 0.95))
                severity_val = gemini_result.get("severity", "MODERATE")

                res = {
                    "prediction_allowed": True,
                    "prediction_id": pred_id,
                    "image_id": img_id,
                    "image_url": None,
                    "crop": crop_name,
                    "scientific_name": sci_name,
                    "plant_family": family_name,
                    "disease": disease_name,
                    "pathogen": gemini_result.get("pathogen", "None" if is_healthy else "Foliar Pathogen"),
                    "symptoms": gemini_result.get("symptoms", "Visual foliage screening complete."),
                    "causes": gemini_result.get("causes", "Microclimatic and biological factors."),
                    "possibleCauses": gemini_result.get("causes", "Microclimatic and biological factors."),
                    "confidence": round(conf_val, 4),
                    "model_confidence": round(conf_val, 4),
                    "confidence_pct": round(conf_val * 100, 1),
                    "severity": severity_val,
                    "status": "HEALTHY" if is_healthy else "DISEASE_DETECTED",
                    "is_plant": True,
                    "rejection_reason": None,
                    "disease_model_status": "VALIDATED_PRODUCTION",
                    "disease_model_version": "UNIVERSAL_DISEASE_v2.0",
                    "model_status": "VALIDATED_PRODUCTION",
                    "model_version": "UNIVERSAL_DISEASE_v2.0",
                    "deployment_status": "PRODUCTION",
                    "architecture": "Google Gemini Multimodal Vision API",
                    "api_engine_used": gemini_result.get("api_engine_used", "Google Gemini Multimodal Vision API"),
                    "engine_type": "UNIVERSAL_API",
                    "ai_prediction": True,
                    "message": f"Universal Vision AI Diagnosis: Identified {disease_name} on {crop_name} ({sci_name}) with {round(conf_val * 100, 1)}% confidence.",
                    "disclaimer": "Diagnostic result generated by Google Gemini Multimodal Vision API. Always verify critical chemical applications with local agricultural extension specialists.",
                    "prediction_timestamp": now_str,
                    "recommendations": gemini_result.get("recommendations", [
                        "Inspect adjacent foliage for symptom spread.",
                        "Ensure proper air circulation through canopy pruning.",
                        "Consult local Krishi Vigyan Kendra (KVK) extension personnel for chemical prescription."
                    ]),
                    "top_predictions": gemini_result.get("top_predictions", [{
                        "crop": crop_name,
                        "disease": disease_name,
                        "probability": round(conf_val * 100, 1),
                        "is_top": True,
                        "is_healthy": is_healthy
                    }]),
                    "created_at": now_str,
                }

                _DISEASE_HISTORY.append({
                    "user_id": user_id,
                    "prediction_id": pred_id,
                    "image_id": img_id,
                    "crop": res["crop"],
                    "scientific_name": res["scientific_name"],
                    "disease": res["disease"],
                    "pathogen": res["pathogen"],
                    "confidence": res["confidence"],
                    "severity": res["severity"],
                    "status": res["status"],
                    "api_engine_used": res["api_engine_used"],
                    "image_url": None,
                    "created_at": now_str,
                })
                return res

        # 5. Engine B: Local High-Accuracy ResNet-50 Deep CNN
        local_model, local_transform, local_classes, engine_name = get_local_vision_model()
        if not HAS_TORCH or local_model is None or local_transform is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Deep learning vision model is not currently loaded on the server."
            )

        tensor_img = local_transform(img).unsqueeze(0)
        with torch.no_grad():
            outputs = local_model(tensor_img)
            logits = outputs.logits if hasattr(outputs, "logits") else outputs
            probs = torch.softmax(logits / 0.8, dim=-1).squeeze(0).numpy()

        num_classes = len(probs)

        # Crop Hint Processing:
        # Respect visual morphological reality: If the user selects a crop hint (e.g. Grape),
        # but the visual features strongly contradict that hint (e.g., hinted crop prob < 0.10,
        # while another class has high visual probability), do NOT blindly force the wrong host!
        hint_warning = None
        if crop_hint:
            hint_clean = crop_hint.strip().lower()
            if hint_clean not in ["auto", "all", "unknown"]:
                hinted_indices = [idx for idx in range(num_classes) if hint_clean in local_classes.get(idx, "").lower()]
                raw_hint_confidence = float(sum(probs[idx] for idx in hinted_indices)) if hinted_indices else 0.0

                # Only apply prior if the leaf visually shares plausible traits with the hinted crop (>= 10%)
                if raw_hint_confidence >= 0.10:
                    crop_weights = np.ones(num_classes) * 0.35
                    for idx in hinted_indices:
                        crop_weights[idx] = 3.0
                    probs = probs * crop_weights
                    prob_sum = np.sum(probs)
                    if prob_sum > 0:
                        probs = probs / prob_sum
                else:
                    hint_warning = f"Visual leaf morphology contradicts selected host crop hint '{crop_hint}' (visual match < 10%). Diagnosing based on actual visual botanical features."
                    logger.info(hint_warning)

        # Top-3 predictions
        top_3_indices = np.argsort(probs)[::-1][:3]
        top_idx = int(top_3_indices[0])
        top_conf = float(probs[top_idx])
        raw_class_name = local_classes.get(top_idx, "Plant___healthy")

        top_predictions = []
        for rank, idx in enumerate(top_3_indices):
            cls_name = local_classes.get(int(idx), "Unknown")
            info = DISEASE_CATALOG.get(cls_name, {})
            p_val = float(probs[idx])
            top_predictions.append({
                "crop": info.get("crop", cls_name.split("___")[0].replace("_", " ")),
                "disease": info.get("condition", cls_name.split("___")[-1].replace("_", " ") if "___" in cls_name else cls_name),
                "probability": round(p_val * 100, 1),
                "is_top": rank == 0,
                "is_healthy": info.get("is_healthy", "healthy" in cls_name.lower())
            })

        # Check for Out-Of-Distribution (unrecognized leaf pattern)
        is_ood = (top_conf < 0.28) or (len(top_3_indices) > 1 and (probs[top_3_indices[0]] - probs[top_3_indices[1]]) < 0.03 and top_conf < 0.35)

        catalog_entry = DISEASE_CATALOG.get(raw_class_name, {
            "crop": raw_class_name.split("___")[0].replace("_", " "),
            "scientific_name": "Botanical plant specimen",
            "plant_family": "Angiosperm",
            "condition": raw_class_name.split("___")[-1].replace("_", " ") if "___" in raw_class_name else raw_class_name,
            "pathogen": "Foliar Pathogen",
            "severity": "MODERATE",
            "is_healthy": "healthy" in raw_class_name.lower(),
            "symptoms": "Leaf tissue structural anomalies detected by vision scan.",
            "causes": "Environmental moisture and temperature conditions favoring foliar infection.",
            "recommendations": [
                "Inspect adjacent foliage to check for symptom spread.",
                "Ensure proper air circulation through pruning lower leaves.",
                "Consult local Krishi Vigyan Kendra (KVK) extension personnel for confirmation."
            ]
        })

        if is_ood and (not crop_hint or crop_hint.lower() in ["auto", "all", "unknown"]):
            crop_name = "Botanical Plant Specimen (Uncataloged Species)"
            sci_name = "Angiospermae"
            condition_name = "Foliage Health Screened — Profile Uncataloged"
            pathogen = "Unconfirmed"
            is_healthy = False
            status_text = "UNKNOWN_OR_LOW_CONFIDENCE"
            message_text = (
                f"Plant foliage verified ({round(top_conf * 100, 1)}% matching closest profile {catalog_entry['crop']}), "
                f"but does not decisively match cataloged benchmark profiles. "
                f"Please select your specific crop from the selector above or enable the Universal Vision AI key for open-world identification."
            )
        elif catalog_entry["is_healthy"]:
            crop_name = catalog_entry["crop"]
            sci_name = catalog_entry.get("scientific_name", "")
            condition_name = catalog_entry["condition"]
            pathogen = catalog_entry["pathogen"]
            is_healthy = True
            status_text = "HEALTHY"
            message_text = f"Diagnostic Analysis: Healthy {crop_name} foliage confirmed with no active pathogen symptoms detected."
        else:
            crop_name = catalog_entry["crop"]
            sci_name = catalog_entry.get("scientific_name", "")
            condition_name = catalog_entry["condition"]
            pathogen = catalog_entry["pathogen"]
            is_healthy = False
            status_text = "DISEASE_DETECTED"
            message_text = f"Diagnostic Analysis: Identified {condition_name} ({pathogen}) on {crop_name} with {round(top_conf * 100, 1)}% confidence."

        if hint_warning:
            message_text = f"[Notice: {hint_warning}] {message_text}"

        res = {
            "prediction_allowed": True,
            "prediction_id": pred_id,
            "image_id": img_id,
            "image_url": None,
            "crop": crop_name,
            "scientific_name": sci_name,
            "plant_family": catalog_entry.get("plant_family", "Plantae"),
            "disease": condition_name,
            "pathogen": pathogen,
            "symptoms": catalog_entry.get("symptoms", "Visual screening complete."),
            "causes": catalog_entry.get("causes", "Microclimatic and environmental conditions."),
            "possibleCauses": catalog_entry.get("causes", "Microclimatic and environmental conditions."),
            "confidence": round(top_conf, 4),
            "model_confidence": round(top_conf, 4),
            "confidence_pct": round(top_conf * 100, 1),
            "severity": catalog_entry.get("severity", "MODERATE"),
            "status": status_text,
            "is_plant": True,
            "rejection_reason": None,
            "disease_model_status": "VALIDATED_PRODUCTION",
            "disease_model_version": "UNIVERSAL_DISEASE_v2.0",
            "model_status": "VALIDATED_PRODUCTION",
            "model_version": "UNIVERSAL_DISEASE_v2.0",
            "deployment_status": "PRODUCTION",
            "data_status": "REAL_PLANTVILLAGE_BENCHMARK",
            "architecture": "ResNet-50 Deep CNN Super Model",
            "super_model": True,
            "api_engine_used": engine_name,
            "engine_type": "LOCAL_CNN",
            "ai_prediction": True,
            "message": message_text,
            "disclaimer": "Image-based identification is a decision-support result generated by PyTorch ResNet-50 CNN. Always consult local agricultural extension specialists for critical field interventions.",
            "prediction_timestamp": now_str,
            "recommendations": catalog_entry.get("recommendations", []),
            "top_predictions": top_predictions,
            "created_at": now_str,
        }

        _DISEASE_HISTORY.append({
            "user_id": user_id,
            "prediction_id": pred_id,
            "image_id": img_id,
            "crop": res["crop"],
            "scientific_name": res["scientific_name"],
            "disease": res["disease"],
            "pathogen": res["pathogen"],
            "confidence": res["confidence"],
            "severity": res["severity"],
            "status": res["status"],
            "api_engine_used": res["api_engine_used"],
            "image_url": None,
            "created_at": now_str,
        })

        return res

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        return [item for item in _DISEASE_HISTORY if item.get("user_id") == user_id][-20:]

    def get_prediction_detail(self, user_id: str, prediction_id: str) -> Dict[str, Any]:
        for item in _DISEASE_HISTORY:
            if item["prediction_id"] == prediction_id:
                if item.get("user_id") != user_id:
                    raise HTTPException(status_code=403, detail="Access forbidden to requested diagnosis record.")
                return item
        raise HTTPException(status_code=404, detail="Disease diagnosis record not found.")

    def delete_user_record(self, user_id: str, prediction_id: str) -> Dict[str, Any]:
        global _DISEASE_HISTORY
        initial_len = len(_DISEASE_HISTORY)
        _DISEASE_HISTORY = [
            item for item in _DISEASE_HISTORY
            if not (item.get("user_id") == user_id and item.get("prediction_id") == prediction_id)
        ]
        return {
            "success": True,
            "deleted": initial_len > len(_DISEASE_HISTORY),
            "prediction_id": prediction_id
        }

    def clear_user_history(self, user_id: str) -> Dict[str, Any]:
        global _DISEASE_HISTORY
        _DISEASE_HISTORY = [item for item in _DISEASE_HISTORY if item.get("user_id") != user_id]
        return {"success": True, "message": "History cleared successfully"}


disease_service = DiseaseService()
