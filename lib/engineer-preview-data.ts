// Preview content stays local while the CMS integration is paused.
export const engineerProjects = [
  {
    slug: "chit-chat-with-food",
    name: "CraveNChat",
    decision: {
      title: "Save the order, then broadcast it.",
      detail: "The order endpoint persists the order through Spring Data JPA before publishing the saved record to /topic/orders. The kitchen receives the stored order rather than an unpersisted request.",
      tradeoff: "Persistence and messaging are separate operations here. A successful save does not guarantee that every subscriber receives the update; a transactional outbox would be a future reliability improvement.",
      url: "https://github.com/Devyl-byte/CraveNChat/blob/60d13b56b83450d438daf38ee260421342a21ae3/backend/src/main/java/com/xdcoders/cravechat/controller/OrderController.java",
      label: "Inspect OrderController.java",
    },
    summary: "Canteen ordering, campus chat, and a simple AI assistant in one application.",
    role: "Product concept & backend / team of two",
    period: "Dec 2025 - Apr 2026",
    stack: ["React / Vite", "Java 21", "Spring Boot", "WebSocket / STOMP", "PostgreSQL"],
    contributions: [
      "Defined the product concept and selected the application frameworks.",
      "Worked on the Java and Spring Boot backend for the canteen application.",
      "Worked on WebSocket communication for campus chat and live order updates."
    ],
    liveUrl: "",
    sourceUrl: "https://github.com/Devyl-byte/CraveNChat",
    overviewTitle: "Order food. Stay in the conversation.",
    overview: "Students browse available menu items, place orders, and chat on campus. A kitchen dashboard brings incoming orders together for administrators.",
    technicalFocus: "The application combines a React/Vite frontend with Spring Boot services and PostgreSQL persistence. A simple AI assistant endpoint handles menu and order questions.",
    architecture: "React, Vite, Tailwind CSS, React Router, and Axios form the frontend. Spring Boot exposes menu, ordering, and assistant endpoints. WebSocket/STOMP supports live communication; Spring Data JPA connects the backend to PostgreSQL.",
    workflow: [],
    faq: [
      { question: "What did you work on?", answer: "My scope was the product concept, framework selection, and Java/Spring Boot backend, including WebSocket communication. This was a two-person project." },
      { question: "What happens after a student places an order?", answer: "The order-placement API saves the order through Spring Data JPA in PostgreSQL, then broadcasts the new order to the kitchen dashboard over WebSocket/STOMP. The chat backend also uses Spring messaging and WebSocket/STOMP." },
      { question: "What does the assistant do?", answer: "A simple AI assistant endpoint provides menu and order help, separate from the core ordering workflow." },
      { question: "Can I run it locally?", answer: "The GitHub repository includes setup instructions and example configuration. It requires Java 21, Node.js 20 or newer, npm, and PostgreSQL." }
    ],
  },
  {
    slug: "store-intelligence",
    name: "Store Intelligence",
    decision: {
      title: "Deduplicate at the storage boundary.",
      detail: "The event ID is the SQLite primary key. INSERT OR IGNORE prevents a replay of the same ID from creating a second record, and the insertion result distinguishes new records from duplicates. SQL values are passed as parameters.",
      tradeoff: "A repeated ID with a changed payload is ignored, not treated as a correction. Explicit event versioning would be needed if updates to existing events became a requirement.",
      url: "https://github.com/Devyl-byte/STORE--INTELLIGENCE/blob/f19a6499e3847b275e8525824a84d8730f5976a5/app/database.py",
      label: "Inspect database.py",
    },
    summary: "A retail analytics prototype connecting video-derived events and POS data to a live dashboard.",
    role: "Development workflow, tools analysis & backend APIs", period: "",
    stack: ["Python", "FastAPI", "OpenCV", "SQLite", "Docker", "JavaScript"],
    contributions: ["Planned the development flow and evaluated tools for the challenge submission.", "Worked on backend APIs for visitor events and store analytics."],
    liveUrl: "", sourceUrl: "https://github.com/Devyl-byte/STORE--INTELLIGENCE",
    overviewTitle: "From store activity to queryable events.",
    overview: "Built for the Purplle Store Intelligence challenge, the project explores how CCTV clips and point-of-sale data can support visitor metrics, conversion funnels, heatmaps, and anomaly views.",
    technicalFocus: "A Python pipeline emits structured JSONL events. Replay feeds those events to a FastAPI application backed by SQLite, while the web dashboard refreshes analytics every three seconds.",
    architecture: "OpenCV frame sampling, person detection, tracking, and heuristics produce event records. An optional YOLOv8 integration provides another detection path. A replay utility sends events to the ingestion API, with SQLite storage and analytics endpoints for the dashboard.",
    workflow: ["CCTV clips + POS data", "Python detection + JSONL", "FastAPI + SQLite", "Metrics + dashboard"],
    faq: [
      { question: "What did you build on the backend?", answer: "I implemented five business endpoints for ingestion, visitor metrics, funnels, heatmaps, and rule-based alerts. My work included Pydantic validation, SQLite persistence, event-ID deduplication, parameterized SQL, and rejected-record logging." },
      { question: "Why FastAPI and SQLite?", answer: "I selected these for the prototype and separated the backend into ingestion, storage, and analytics modules. FastAPI handles the API boundary and validation; SQLite keeps persistence local. This choice is not a claim of production-scale capacity." },
      { question: "Is this a production CCTV system?", answer: "No. It is a challenge prototype. Some event-generation behavior uses illustrative heuristics; production accuracy, scalability, and operational reliability have not been established." },
      { question: "Where is computer vision used?", answer: "The pipeline uses OpenCV HOG detection, motion contours, and tracking to generate events. An optional YOLOv8 detection path is available. No measured accuracy claim is made here." },
      { question: "What does the dashboard show?", answer: "Visitor metrics, conversion funnels, zone heatmaps, and rule-based anomalies such as queue spikes and conversion drops, refreshed every three seconds." },
      { question: "What is covered by tests?", answer: "The repository includes tests for ingestion and analytics edge cases such as empty stores, duplicates, staff-only footage, re-entry, and queue anomalies. These tests were not rerun as part of this portfolio update." }
    ],
  },
  {
    slug: "piksy",
    name: "Piksy",
    decision: {
      title: "Create the image in the browser.",
      detail: "Canvas renders the message and exports a PNG. The sharing action checks whether the browser supports sharing files; a PNG download provides a fallback. A revision counter discards stale image-generation callbacks when the text changes.",
      tradeoff: "Native file sharing depends on the device and browser. Download remains available, while View Once must be selected in WhatsApp. The deployed app currently uses the name Peek.",
      url: "https://piksy.xyz/app.js",
      label: "Inspect deployed JavaScript",
    },
    summary: "Turn text into an image to share on WhatsApp or elsewhere.",
    role: "Text-to-image sharing tool", period: "", stack: [], contributions: [], liveUrl: "https://piksy.xyz", sourceUrl: "",
    overviewTitle: "A different way to send a message.",
    overview: "Piksy turns text into an image for sharing. It was designed with WhatsApp's View Once photo workflow in mind, while the resulting image can also be shared elsewhere.",
    technicalFocus: "Piksy creates the image; delivery settings belong to the app used to send it. Piksy itself does not make an image temporary or guarantee privacy.",
    architecture: "", workflow: ["Write your text", "Create an image", "Share in your messaging app"],
    faq: [
      { question: "What problem does Piksy solve?", answer: "It turns a written message into an image so it can be shared where a photo makes more sense than plain text. The main use case is preparing text for WhatsApp's View Once photo workflow." },
      { question: "Is it only for WhatsApp?", answer: "No. WhatsApp is the main use case, but the image can be shared in other apps too." },
      { question: "Does Piksy automatically enable View Once?", answer: "No. Piksy creates an image from text. View Once is a sending option in WhatsApp, not a privacy control provided by Piksy." }
    ],
  },
];
