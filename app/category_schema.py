WOMEN_RING_CONFIG = {
    "category": "women",
    "subcategory": "rings",
    "ring_types": [
        "engagement", "wedding_band", "cocktail", "solitaire", "halo",
        "three_stone", "eternity", "stackable", "promise", "vintage",
        "designer", "gemstone", "diamond", "custom"
    ],
    "materials": [
        "platinum", "yellow_gold", "white_gold", "rose_gold",
        "sterling_silver", "mixed_metal"
    ],
    "gemstones": [
        "sapphire", "emerald", "ruby", "amethyst", "opal", "topaz", "diamond"
    ]
}
MASCOT_TRIGGERS = {
    ("engagement", "platinum", "diamond"): {
        "mascot_trigger": "snowman_misfire",
        "overlay": "sparkle_trail",
        "sound_effect": "goat_bleat"
    },
    ("cocktail", "yellow_gold", "amethyst"): {
        "mascot_trigger": "goat_twirl",
        "overlay": "confetti_burst",
        "sound_effect": "party_honk"
    }
}
