DECISION_TREE = {

    # ── Scope ─────────────────────────────────────────────────────────────────
    "step_1": {
        "question": (
            "Is the AI system in scope of the EU AI Act? "
            "(deployed in the EU, or its output is used in the EU, by a provider / deployer / importer / distributor — "
            "excludes military, national security, personal non-professional use, and pure R&D)"
        ),
        "yes": "step_2",
        "no":  "out_of_scope",
    },

    # ── Role change ───────────────────────────────────────────────────────────
    "step_2": {
        "question": (
            "Has the deployer become a provider? "
            "(placed the system under their own name or trademark, made a substantial modification, "
            "or changed the intended purpose so that the system becomes high-risk)"
        ),
        "yes": "step_2a",
        "no":  "step_2a",   # both paths continue to Article 5 checks
    },

    # ── Article 5 — prohibited practices (one check per step) ─────────────────

    "step_2a": {
        "question": (
            "Does the system perform social scoring? "
            "(a public authority or municipality assigns a score, index, reliability rating, or ranking "
            "to individual citizens based on their behavior, transactions, or personal characteristics, "
            "and that score affects their access to services, priority treatment, or verification requirements)"
        ),
        "yes": "prohibited_social_scoring",
        "no":  "step_2b",
    },

    "step_2b": {
        "question": (
            "Does the system use subliminal, manipulative, or deceptive techniques "
            "that materially distort a person's behavior in a way that causes or is likely to cause significant harm?"
        ),
        "yes": "prohibited_manipulation",
        "no":  "step_2c",
    },

    "step_2c": {
        "question": (
            "Does the system exploit vulnerabilities of a specific group of persons "
            "(based on age, disability, or social or economic situation) "
            "to distort their behavior in a way that causes or is likely to cause harm?"
        ),
        "yes": "prohibited_exploitation",
        "no":  "step_2d",
    },

    "step_2d": {
        "question": (
            "Does the system perform real-time remote biometric identification "
            "(e.g. facial recognition, gait analysis, fingerprint matching) "
            "in publicly accessible spaces for law enforcement purposes?"
        ),
        "yes": "prohibited_biometric",
        "no":  "step_3",
    },

    # ── High-risk classification ───────────────────────────────────────────────
    "step_3": {
        "question": (
            "Is the system high-risk under Annex III? "
            "(used in: biometric ID, critical infrastructure, education/training access, "
            "employment/worker management, essential private/public services such as credit or social benefits, "
            "law enforcement, migration/border control, or administration of justice)"
        ),
        "yes": "step_4",
        "no":  "step_6",
    },

    # ── High-risk exemption ───────────────────────────────────────────────────
    "step_4": {
        "question": (
            "Does the system qualify for the Article 6.3 exemption from high-risk classification? "
            "(it only performs a narrow procedural task, improves a previously completed human activity, "
            "detects patterns without influencing decisions about people, "
            "or poses no significant risk to health, safety, or fundamental rights)"
        ),
        "yes": "step_6",          # exempted → not high-risk → check transparency
        "no":  "step_5",          # confirmed high-risk → determine role
    },

    # ── Role determination for high-risk ──────────────────────────────────────
    "step_5": {
        "question": (
            "Is the user a provider or provider's representative? "
            "(developed or placed the system on the EU market under their own name, "
            "or is the authorised representative of a non-EU provider)"
        ),
        "yes": "high_risk_provider",
        "no":  "step_5a",
    },

    "step_5a": {
        "question": (
            "Is the user an importer? "
            "(established in the EU and placing a third-country provider's AI system on the EU market)"
        ),
        "yes": "high_risk_importer",
        "no":  "step_5b",
    },

    "step_5b": {
        "question": (
            "Is the user a distributor? "
            "(makes the AI system available on the EU market without being the provider or importer)"
        ),
        "yes": "high_risk_distributor",
        "no":  "step_5c",
    },

    "step_5c": {
        "question": (
            "Is the user a deployer? "
            "(uses the AI system under their authority in a professional context, "
            "and is not the provider, importer, or distributor)"
        ),
        "yes": "step_5d",
        "no":  "high_risk_deployer",   # default to deployer if no other role fits
    },

    "step_5d": {
        "question": (
            "Is the deployer a public authority or a private company mandated to provide public services? "
            "(utilities, transport, healthcare, education, or similar public-interest services)"
        ),
        "yes": "high_risk_deployer_public",
        "no":  "high_risk_deployer",
    },

    # ── Transparency obligations ───────────────────────────────────────────────
    "step_6": {
        "question": (
            "Does the system fall under Article 50 transparency obligations? "
            "(it is a chatbot / conversational AI, generates synthetic media such as deepfakes, "
            "performs emotion recognition, or performs biometric categorisation)"
        ),
        "yes": "transparency_obligation",
        "no":  "step_7",
    },

    # ── GPAI classification ────────────────────────────────────────────────────
    "step_7": {
        "question": (
            "Is the system a General Purpose AI (GPAI) model? "
            "(trained on broad data at scale, capable of a wide range of distinct tasks, "
            "and made available to third parties via API, open source, or product integration)"
        ),
        "yes": "step_8",
        "no":  "minimal_risk",
    },

    "step_8": {
        "question": (
            "Does the GPAI model pose systemic risk? "
            "(designated by the Commission as high-impact, "
            "or trained with cumulative compute exceeding 10^25 FLOPs)"
        ),
        "yes": "gpai_systemic_risk",
        "no":  "gpai_standard",
    },
}


RISK_OUTCOMES = {

    # ── Out of scope ───────────────────────────────────────────────────────────
    "out_of_scope": {
        "level": "OUT OF SCOPE",
        "articles": ["Article 2"],
        "description": (
            "The system is not subject to the EU AI Act. "
            "It is used exclusively for military, national security, personal non-professional, "
            "or pure R&D purposes, or has no nexus to the EU market."
        ),
    },

    # ── Prohibited ─────────────────────────────────────────────────────────────
    "prohibited_social_scoring": {
        "level": "PROHIBITED",
        "articles": ["Article 5(1)(c)"],
        "description": (
            "The system is prohibited. "
            "It performs social scoring by a public authority — "
            "assigning behavioral scores or indices to citizens that affect their access to services or treatment. "
            "This practice is explicitly banned under Article 5(1)(c) of the EU AI Act."
        ),
    },

    "prohibited_manipulation": {
        "level": "PROHIBITED",
        "articles": ["Article 5(1)(a)"],
        "description": (
            "The system is prohibited. "
            "It uses subliminal or manipulative techniques that distort human behavior causing significant harm, "
            "banned under Article 5(1)(a) of the EU AI Act."
        ),
    },

    "prohibited_exploitation": {
        "level": "PROHIBITED",
        "articles": ["Article 5(1)(b)"],
        "description": (
            "The system is prohibited. "
            "It exploits vulnerabilities of specific groups (age, disability, social situation) "
            "to distort behavior in a harmful way, banned under Article 5(1)(b) of the EU AI Act."
        ),
    },

    "prohibited_biometric": {
        "level": "PROHIBITED",
        "articles": ["Article 5(1)(d)"],
        "description": (
            "The system is prohibited. "
            "It performs real-time remote biometric identification in publicly accessible spaces "
            "for law enforcement, banned under Article 5(1)(d) of the EU AI Act."
        ),
    },

    # ── High-risk ──────────────────────────────────────────────────────────────
    "high_risk_provider": {
        "level": "HIGH RISK",
        "articles": ["Article 6", "Article 16", "Article 17", "Article 18",
                     "Article 19", "Article 20", "Article 21", "Article 72", "Article 99"],
        "description": (
            "The system is high-risk and the user is a PROVIDER. "
            "Obligations include: conformity assessment, CE marking, technical documentation, "
            "EU database registration, post-market monitoring, and incident reporting."
        ),
    },

    "high_risk_importer": {
        "level": "HIGH RISK",
        "articles": ["Article 6", "Article 23", "Article 99"],
        "description": (
            "The system is high-risk and the user is an IMPORTER. "
            "Obligations include: verifying conformity assessment, CE marking, "
            "and technical documentation before placing on the EU market."
        ),
    },

    "high_risk_distributor": {
        "level": "HIGH RISK",
        "articles": ["Article 6", "Article 24", "Article 99"],
        "description": (
            "The system is high-risk and the user is a DISTRIBUTOR. "
            "Obligations include: verifying CE marking and declaration of conformity "
            "before making the system available."
        ),
    },

    "high_risk_deployer": {
        "level": "HIGH RISK",
        "articles": ["Article 6", "Article 26", "Article 99"],
        "description": (
            "The system is high-risk and the user is a DEPLOYER. "
            "Obligations include: using the system per instructions of use, "
            "assigning human oversight, monitoring for risks, and retaining logs."
        ),
    },

    "high_risk_deployer_public": {
        "level": "HIGH RISK",
        "articles": ["Article 6", "Article 26", "Article 27", "Article 99"],
        "description": (
            "The system is high-risk and the deployer is a PUBLIC AUTHORITY or public-service provider. "
            "In addition to standard deployer obligations, a fundamental rights impact assessment "
            "is required before deployment under Article 27."
        ),
    },

    # ── Transparency ───────────────────────────────────────────────────────────
    "transparency_obligation": {
        "level": "LIMITED RISK",
        "articles": ["Article 50", "Article 99"],
        "description": (
            "The system has limited risk but is subject to Article 50 transparency obligations. "
            "It must disclose its AI nature to users (chatbot disclosure, synthetic media labelling, "
            "emotion recognition notice, or biometric categorisation notice)."
        ),
    },

    # ── GPAI ───────────────────────────────────────────────────────────────────
    "gpai_standard": {
        "level": "GPAI",
        "articles": ["Article 51", "Article 53"],
        "description": (
            "The system is a General Purpose AI model without systemic risk. "
            "Obligations include: technical documentation, transparency to downstream providers, "
            "copyright policy, and publication of a summary of training data."
        ),
    },

    "gpai_systemic_risk": {
        "level": "GPAI — SYSTEMIC RISK",
        "articles": ["Article 51", "Article 53", "Article 54"],
        "description": (
            "The system is a General Purpose AI model WITH systemic risk. "
            "In addition to standard GPAI obligations, the provider must conduct adversarial testing, "
            "report serious incidents to the Commission, implement cybersecurity measures, "
            "and report energy consumption."
        ),
    },

    # ── Minimal risk ───────────────────────────────────────────────────────────
    "minimal_risk": {
        "level": "MINIMAL RISK",
        "articles": [],
        "description": (
            "The system poses minimal risk and is not subject to mandatory obligations under the EU AI Act. "
            "Voluntary codes of conduct are encouraged but not required."
        ),
    },
}