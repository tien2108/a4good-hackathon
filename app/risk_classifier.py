# risk_classifier.py

DECISION_TREE = {
    "step_1": {
        "question": "Is the AI system in scope of the EU AI Act based on Art 2? (i.e. placed on EU market, used in EU, or output used in EU — excluding military, national security, personal non-professional use, or pure R&D)",
        "yes": "step_2",
        "no": "out_of_scope"
    },
    "step_2": {
        "question": "Does any condition in Art 25.1 apply? (i.e. the deployer places the system under their own name/trademark, makes a substantial modification, or changes the intended purpose to make it high-risk)",
        "yes": "step_2a",
        "no": "step_3"
    },
    "step_2a": {
        "question": "Is the system prohibited under Art 5? (subliminal manipulation, exploitation of vulnerabilities, biometric categorisation of sensitive attributes, real-time biometric ID in public spaces, social scoring, criminal risk profiling, emotion recognition at work/school, untargeted facial scraping)",
        "yes": "prohibited",
        "no": "step_4"
    },
    "step_3": {
        "question": "Is the system prohibited under Art 5? (subliminal manipulation, exploitation of vulnerabilities, biometric categorisation of sensitive attributes, real-time biometric ID in public spaces, social scoring, criminal risk profiling, emotion recognition at work/school, untargeted facial scraping)",
        "yes": "prohibited",
        "no": "step_4"
    },
    "step_4": {
        "question": "Is the system high-risk based on Art 6.1? (biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, administration of justice)",
        "yes": "step_5",
        "no": "step_6"
    },
    "step_5": {
        "question": "Is the system exempted from high-risk classification based on Art 6.3? (narrow procedural task, improves prior human activity, detects patterns without making decisions about people, no significant risk to rights)",
        "yes": "limited_risk_notify_nca",
        "no": "step_5a"
    },
    "step_5a": {
        "question": "Is the role of the user a provider or provider's representative?",
        "yes": "high_risk_provider",
        "no": "step_5b"
    },
    "step_5b": {
        "question": "Is the role of the user an importer?",
        "yes": "high_risk_importer",
        "no": "step_5c"
    },
    "step_5c": {
        "question": "Is the role of the user a distributor?",
        "yes": "high_risk_distributor",
        "no": "step_5d"
    },
    "step_5d": {
        "question": "Is the role of the user a deployer?",
        "yes": "high_risk_deployer",
        "no": "step_5e"
    },
    "step_5e": {
        "question": "Is the role of the user a public body or a company providing public services?",
        "yes": "high_risk_public_body",
        "no": "high_risk_general"
    },
    "step_6": {
        "question": "Does the system fall into any AI system described in Art 50? (chatbot, synthetic content generation, emotion recognition, biometric categorisation — requiring transparency disclosures)",
        "yes": "limited_risk_art50",
        "no": "step_7"
    },
    "step_7": {
        "question": "Is the system a GPAI model based on Art 51? (trained on broad data, performs wide range of tasks, made available to third parties via API, open source, or product integration)",
        "yes": "step_8",
        "no": "minimal_risk"
    },
    "step_8": {
        "question": "Does the GPAI model have systemic risk? (high-impact capabilities or cumulative training compute above 10^25 FLOPs)",
        "yes": "gpai_systemic_risk",
        "no": "gpai_standard"
    },
}

RISK_OUTCOMES = {
    "out_of_scope": {
        "level": "OUT OF SCOPE",
        "articles": ["Art 2"],
        "description": "Your system might be out of scope. Check Art 2.",
        "disclaimers": [
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "prohibited": {
        "level": "PROHIBITED",
        "articles": ["Art 5", "Art 99.3"],
        "description": "Your system might be prohibited. Check Art 5. Fine details in Art 99.3.",
        "disclaimers": [
            "The AI Act does not replace other EU laws.",
            "Other fine details in Art 99."
        ]
    },
    "limited_risk_notify_nca": {
        "level": "LIMITED RISK",
        "articles": ["Art 6.3"],
        "description": "Your system might be considered limited risk. Please notify the National Competent Authority (NCA).",
        "disclaimers": [
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "high_risk_general": {
        "level": "HIGH RISK",
        "articles": ["Art 6", "Art 9-15"],
        "description": "Your system might be considered high-risk based on Art 6. Requirements in Art 9-15 apply.",
        "disclaimers": [
            "Notifying authorities and notified bodies, Standards, conformity assessment, certificates, and registration may need to be taken into account.",
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "high_risk_provider": {
        "level": "HIGH RISK — PROVIDER",
        "articles": ["Art 6", "Art 9-15", "Art 16-22", "Art 72", "Art 99.4a", "Art 99.4b"],
        "description": "Your system is high-risk. As a provider/provider's representative, Art 16-22 and Art 72 also apply. Fine details in Art 99.4a (provider) or Art 99.4b (representative).",
        "disclaimers": [
            "Notifying authorities and notified bodies, Standards, conformity assessment, certificates, and registration may need to be taken into account.",
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "high_risk_importer": {
        "level": "HIGH RISK — IMPORTER",
        "articles": ["Art 6", "Art 9-15", "Art 23", "Art 99.4c"],
        "description": "Your system is high-risk. As an importer, Art 23 also applies. Fine details in Art 99.4c.",
        "disclaimers": [
            "Notifying authorities and notified bodies, Standards, conformity assessment, certificates, and registration may need to be taken into account.",
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "high_risk_distributor": {
        "level": "HIGH RISK — DISTRIBUTOR",
        "articles": ["Art 6", "Art 9-15", "Art 24", "Art 99.4d"],
        "description": "Your system is high-risk. As a distributor, Art 24 also applies. Fine details in Art 99.4d.",
        "disclaimers": [
            "Notifying authorities and notified bodies, Standards, conformity assessment, certificates, and registration may need to be taken into account.",
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "high_risk_deployer": {
        "level": "HIGH RISK — DEPLOYER",
        "articles": ["Art 6", "Art 9-15", "Art 26", "Art 99.4e"],
        "description": "Your system is high-risk. As a deployer, Art 26 also applies. Fine details in Art 99.4e.",
        "disclaimers": [
            "Notifying authorities and notified bodies, Standards, conformity assessment, certificates, and registration may need to be taken into account.",
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "high_risk_public_body": {
        "level": "HIGH RISK — PUBLIC BODY",
        "articles": ["Art 6", "Art 9-15", "Art 27"],
        "description": "Your system is high-risk. As a public body or company providing public services, Art 27 also applies.",
        "disclaimers": [
            "Notifying authorities and notified bodies, Standards, conformity assessment, certificates, and registration may need to be taken into account.",
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "limited_risk_art50": {
        "level": "LIMITED RISK",
        "articles": ["Art 50", "Art 99.4g"],
        "description": "Your system is classified as Limited Risk under Art 50. Transparency obligations apply — the system must disclose its AI nature to users. Fine details in Art 99.4g.",
        "disclaimers": [
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "gpai_standard": {
        "level": "GPAI",
        "articles": ["Art 51", "Art 52", "Art 53", "Art 54", "Art 101"],
        "description": "Your system is a GPAI model. Follow procedure in Art 52. Obligations in Art 53 (if provider) or Art 54 (if provider representative). Fine details in Art 101.",
        "disclaimers": [
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "gpai_systemic_risk": {
        "level": "GPAI WITH SYSTEMIC RISK",
        "articles": ["Art 51", "Art 52", "Art 53", "Art 54", "Art 101"],
        "description": "Your system is a GPAI model with systemic risk. Follow procedure in Art 52. Obligations in Art 53 (if provider) or Art 54 (if provider representative). Additional obligations in Art 54 also apply due to systemic risk. Fine details in Art 101.",
        "disclaimers": [
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    },
    "minimal_risk": {
        "level": "MINIMAL RISK",
        "articles": [],
        "description": "No specific AI Act obligations apply to your system.",
        "disclaimers": [
            "The AI Act does not replace other EU laws.",
            "Post-market monitoring, information sharing and market surveillance should conform to Chapter IX.",
            "Other fine details in Art 99."
        ]
    }
}