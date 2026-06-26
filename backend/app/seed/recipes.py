"""Seed data for recipes (brew bar, batch brew, signature TTK)."""

SEED_BREW_BAR_RECIPES: list[dict] = [
    {
        "lotName": "Ethiopia Chelbesa",
        "roaster": "TRUD roast",
        "method": "v60",
        "grindClicks": "22 clicks",
        "coffeeWeightG": 15,
        "waterVolumeMl": 250,
        "steps": [
            {"startTime": "0:00", "stageName": "Bloom", "pourVolumeMl": 45, "targetWeightG": 45},
            {"startTime": "0:30", "stageName": "Yellow", "pourVolumeMl": 105, "targetWeightG": 150},
            {"startTime": "1:15", "stageName": "Final pour", "pourVolumeMl": 100, "targetWeightG": 250},
        ],
        "notes": "Clean cup for the brew bar.",
    },
    {
        "lotName": "Kenya Kirinyaga",
        "roaster": "Guest roaster",
        "method": "switch",
        "grindClicks": "24 clicks",
        "coffeeWeightG": 16,
        "waterVolumeMl": 260,
        "steps": [
            {"startTime": "0:00", "stageName": "Open bloom", "pourVolumeMl": 50, "targetWeightG": 50},
            {"startTime": "0:40", "stageName": "Immersion", "pourVolumeMl": 210, "targetWeightG": 260},
            {"startTime": "2:10", "stageName": "Release", "pourVolumeMl": 0, "targetWeightG": 260},
        ],
        "notes": "Use for juicy lots and slower service moments.",
    },
]

SEED_BATCH_BREW_RECIPES: list[dict] = [
    {
        "lotName": "Seasonal blend",
        "roaster": "TRUD roast",
        "thermosVolumeMl": 1000,
        "coffeeDoseG": 60,
        "ratio": "60 g/l",
        "waterVolumeMl": 1000,
        "brewerProgram": "Batch 1L / medium pulse",
        "notes": "Default morning thermos.",
    },
    {
        "lotName": "Brazil + Colombia",
        "roaster": "Guest roaster",
        "thermosVolumeMl": 2000,
        "coffeeDoseG": 120,
        "ratio": "60 g/l",
        "waterVolumeMl": 2000,
        "brewerProgram": "Batch 2L / high volume",
        "notes": "Use for weekend peak.",
    },
]

SEED_SIGNATURE_TTKS: list[dict] = [
    {
        "drinkName": "Latte oblepikha",
        "category": "hot",
        "servingVolumeMl": 240,
        "vessel": "ceramic cup 250 ml",
        "imageUrl": "/brand/interior-2.jpg",
        "ingredients": [
            {"ingredientName": "Double espresso", "exactAmount": "36 g"},
            {"ingredientName": "Sea buckthorn syrup", "exactAmount": "22 g"},
            {"ingredientName": "Milk", "exactAmount": "180 ml"},
        ],
        "serviceSteps": [
            "Add syrup to the cup.",
            "Pull double espresso over the syrup.",
            "Steam milk to glossy texture and pour.",
        ],
        "allergensAndComposition": "Milk. Syrup contains sea buckthorn and sugar.",
        "storageConditions": "Syrup: 72 hours chilled after opening.",
        "notes": "Seasonal hot signature drink.",
    },
    {
        "drinkName": "Filter tonic",
        "category": "cold",
        "servingVolumeMl": 300,
        "vessel": "highball glass",
        "imageUrl": "/brand/interior-2.jpg",
        "ingredients": [
            {"ingredientName": "Cold filter concentrate", "exactAmount": "90 ml"},
            {"ingredientName": "Indian Tonic", "exactAmount": "160 ml"},
            {"ingredientName": "Ice", "exactAmount": "120 g"},
        ],
        "serviceSteps": [
            "Fill glass with ice.",
            "Pour tonic along the wall.",
            "Add coffee concentrate last to keep layers visible.",
        ],
        "allergensAndComposition": "Contains quinine from tonic.",
        "storageConditions": "Concentrate: 24 hours chilled.",
        "notes": "Build directly in glass.",
    },
]