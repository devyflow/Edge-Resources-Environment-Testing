import type { PortfolioData } from "./types";

export const defaultData: PortfolioData = {
  sections: {
    hero: true,
    proof: true,
    focus: true,
    projects: true,
    notes: true,
    skills: true,
    experience: true,
    resume: true,
    contact: true,
    footer: true,
    projectScreenshots: true,
    projectDemo: true,
    projectCaseStudy: true,
    projectWorkflow: true,
    projectLearning: true,
    projectFaq: true
  },
  profile: {
    name: "Devyanshu Agrawal",
    initials: "DA",
    roleLine: "React, Python automation, AI workflows",
    email: "idevyansh.agr@gmail.com",
    github: "https://github.com/Devyl-byte",
    linkedin: "https://www.linkedin.com/in/devyanshuv-agrawal/",
    youtube: "",
    heroPrefix: "I turn product ideas into",
    heroWords: ["store dashboards", "WhatsApp automations", "AI/Python workflows", "clear full-stack demos"],
    heroLead:
      "I build React interfaces and backend workflows that show the full story: problem, screenshots, demo video, GitHub, decisions, and what the product actually does.",
    availability: "Open to frontend, full-stack, AI workflow, and freelance builds."
  },
  resume: {
    publicTitle: "Public sanitized resume",
    publicNote:
      "Keep email, LinkedIn, GitHub, skills, experience, education, and projects. Do not expose DOB, full address, passport details, or personal identifiers.",
    downloadUrl: "/devyanshu-agrawal-sanitized-resume-preview.pdf",
    requestUrl: "mailto:idevyansh.agr@gmail.com?subject=Request%20full%20resume"
  },
  projects: [
    {
      id: "store-intelligence",
      title: "Store Intelligence",
      kicker: "Dashboard case",
      cardSummary: "Draft: analytics-style dashboard for store/business signals, sales visibility, and decision support.",
      outcome: "A business/store insight dashboard concept focused on visible metrics, actions, and AI/Python-backed analysis.",
      role: "Frontend, dashboard logic, AI/Python positioning",
      stack: "React, Python, AI/ML, APIs, dashboard UI",
      status: "Draft case page - final links and screenshots pending",
      tags: ["ai", "frontend", "backend"],
      pills: ["Python", "AI/ML", "React", "Dashboard", "APIs"],
      thumbType: "store",
      problem:
        "Store or business operators often need quick visibility into performance signals, but dashboards become hard to trust when they hide context or action behind charts.",
      solution:
        "Create a clear dashboard case that shows the metric, the reason it matters, the underlying flow, and the action a user can take next.",
      built: "A recruiter-friendly case structure for charts, insight cards, data logic, AI/Python explanation, screenshots, and demo space.",
      workflow: [
        "Collect or simulate store/business signals and define the key metrics.",
        "Process the data through Python or backend API logic.",
        "Render clear React dashboard views with visible insight and action states.",
        "Use AI/Python context only where it improves summary, detection, automation, or explanation."
      ],
      challenges:
        "The main challenge is making the dashboard feel useful rather than decorative. Every chart needs a reason, every insight needs context, and every AI claim needs evidence.",
      learnings:
        "This page should prove product thinking: data visibility, clean UI, practical Python, and clear explanation instead of vague analytics language.",
      screenshots: [
        { title: "Dashboard overview", caption: "Top metrics, alert cards, and the main performance story." },
        { title: "Insight drilldown", caption: "A view that explains what changed and what action is suggested." },
        { title: "AI/Python context", caption: "Where automation, summaries, or analysis fit into the product." }
      ],
      faqs: [
        {
          question: "What should the final demo show?",
          answer: "The dashboard opening, a metric changing, an insight being explained, and the action path a user would take."
        },
        {
          question: "What links are still needed?",
          answer: "GitHub, live URL if deployed, screenshots, and YouTube demo or walkthrough URL."
        },
        {
          question: "How should AI be described?",
          answer: "Tie it to a specific job: summarizing, detecting, forecasting, classifying, or automating a workflow."
        }
      ]
    },
    {
      id: "whatsapp-workflow",
      title: "WhatsApp Workflow Project",
      kicker: "Automation case",
      cardSummary: "Draft: WhatsApp-connected automation for leads, orders, support, or notifications. Final scope needed.",
      outcome: "A workflow automation case for leads, support, orders, or notifications using APIs, webhooks, and Python/backend logic.",
      role: "Automation flow, backend/API design, product UI explanation",
      stack: "Python, APIs, webhooks, FastAPI/Spring Boot, WhatsApp workflow",
      status: "Draft case page - exact scope pending",
      tags: ["automation", "backend", "ai"],
      pills: ["Automation", "Webhooks", "Python", "APIs"],
      thumbType: "whatsapp",
      problem:
        "Teams lose time when WhatsApp conversations, lead follow-ups, order updates, or support messages stay manual and disconnected from product systems.",
      solution:
        "Design a controlled automation flow where a trigger starts the process, backend logic routes the event, and the user/client sees a clear status or reply path.",
      built: "A case page ready for the trigger, webhook/API flow, backend logic, message templates, dashboard visibility, screenshots, and demo video.",
      workflow: [
        "Define the trigger: lead form, order status, support request, or notification event.",
        "Route the event through API/webhook logic and validate the payload.",
        "Use Python or backend services to process, log, and respond to the workflow.",
        "Show the user-facing message flow and operator visibility in the project demo."
      ],
      challenges:
        "The final page needs to clarify whether this is a real WhatsApp Business API integration, a simulated workflow, or a prototype. That honesty will make it stronger.",
      learnings:
        "This can become a strong freelance signal because it connects real business pain with automation, backend thinking, and clear user communication.",
      screenshots: [
        { title: "Trigger setup", caption: "The event that starts the workflow." },
        { title: "Message flow", caption: "User/client conversation or notification states." },
        { title: "Operator visibility", caption: "Logs, statuses, or dashboard view for tracking." }
      ],
      faqs: [
        {
          question: "Is this using the official WhatsApp API?",
          answer: "That needs your confirmation. The page should state clearly whether it is official API, webhook prototype, or simulated flow."
        },
        {
          question: "What should the video include?",
          answer: "Trigger the flow, show the backend/dashboard state, and show the resulting message or notification."
        },
        {
          question: "Why is this useful for clients?",
          answer: "It demonstrates practical automation for leads, support, orders, reminders, or notifications."
        }
      ]
    },
    {
      id: "chit-chat-food",
      title: "Chit-Chat with Food System",
      kicker: "Full-stack case",
      cardSummary: "Real-time food ordering and chat workflow using React, Spring Boot, WebSockets, and MySQL.",
      outcome: "A real-time food ordering and chat workflow using React, Spring Boot, WebSockets, and MySQL.",
      role: "Frontend and backend collaboration, real-time flow implementation",
      stack: "React, Spring Boot, WebSockets, MySQL, REST APIs",
      status: "Resume-backed case - links pending",
      tags: ["frontend", "backend", "automation"],
      pills: ["React", "Spring Boot", "WebSockets", "MySQL"],
      thumbType: "food",
      problem: "Food ordering and communication flows can become fragmented when order state and chat are separated.",
      solution: "Bring the order workflow and chat interaction into one real-time web experience.",
      built: "Responsive screens, chat/order states, backend routes, WebSocket communication, and database-backed workflow pieces.",
      workflow: [
        "User interacts with food/order screens in the React UI.",
        "Backend services manage order and chat-related actions.",
        "WebSockets keep communication or status updates responsive.",
        "MySQL stores workflow data for retrieval and tracking."
      ],
      challenges: "The important detail is showing how real-time updates and backend state stay understandable to the user.",
      learnings: "This page should highlight practical full-stack fundamentals: UI, APIs, WebSockets, SQL, and debugging.",
      screenshots: [
        { title: "Ordering flow", caption: "Main user journey for menu/order actions." },
        { title: "Chat state", caption: "Real-time communication or status updates." },
        { title: "Backend view", caption: "API/database structure or workflow explanation." }
      ],
      faqs: [
        {
          question: "What should recruiters notice?",
          answer: "React UI, Spring Boot backend, WebSocket flow, SQL persistence, and debugging awareness."
        },
        { question: "What links are needed?", answer: "GitHub and live/deployed preview if available." },
        { question: "What should the demo prove?", answer: "A user action updates state and the real-time flow behaves clearly." }
      ]
    },
    {
      id: "meta-openenv",
      title: "Meta OpenEnv Benchmark",
      kicker: "AI benchmark case",
      cardSummary: "Inference script and environment setup work for benchmark submission and reporting.",
      outcome: "Inference script and environment setup work for benchmark submission, automation, and reporting.",
      role: "Python scripting, setup automation, benchmark workflow",
      stack: "Python, OpenAI SDK, Docker, Bash, reporting",
      status: "AI/Python case - details pending",
      tags: ["ai", "backend"],
      pills: ["Python", "OpenAI SDK", "Docker", "Bash"],
      thumbType: "ai",
      problem: "Benchmark workflows can be fragile when setup, inference execution, and reporting are not clearly documented.",
      solution: "Build and explain a repeatable workflow that prepares the environment, runs inference, and makes the result easy to report.",
      built: "A project page structure for setup steps, script behavior, execution flow, result capture, and lessons learned.",
      workflow: [
        "Prepare environment and dependencies.",
        "Run inference or benchmark script with the required inputs.",
        "Capture output and validate result format.",
        "Document reproducible steps and reporting notes."
      ],
      challenges:
        "This page should avoid sounding abstract. It needs concrete setup screenshots, terminal outputs, and a short explanation of what was automated.",
      learnings: "Strong AI compatibility signal comes from reproducibility, debugging, and explaining the workflow clearly.",
      screenshots: [
        { title: "Setup", caption: "Environment, dependencies, or Docker/Bash steps." },
        { title: "Run", caption: "Inference script execution and output state." },
        { title: "Report", caption: "Submission or result summary." }
      ],
      faqs: [
        {
          question: "What makes this portfolio-worthy?",
          answer: "It shows AI workflow handling beyond UI: scripts, setup, reproducibility, and reporting."
        },
        { question: "What assets are needed?", answer: "Terminal screenshots, repo link, and a short demo/walkthrough." },
        { question: "How should it be positioned?", answer: "As AI engineering support work, not as an inflated product claim." }
      ]
    },
    {
      id: "vigilanceconnect",
      title: "VigilanceConnect",
      kicker: "AI/NLP research case",
      cardSummary: "AI-driven pharmacovigilance research framework using NLP, Vertex AI, and safety-reporting concepts.",
      outcome: "An AI-driven pharmacovigilance research framework using NLP, Vertex AI, and safety-reporting concepts.",
      role: "AI/NLP research, cloud AI exploration, workflow explanation",
      stack: "Python, BioBERT, Vertex AI, GCP, NLP",
      status: "Research case - details pending",
      tags: ["ai", "backend"],
      pills: ["Python", "BioBERT", "Vertex AI", "GCP"],
      thumbType: "ai",
      problem:
        "Safety-reporting workflows need structured extraction and interpretation from complex text, but the technical story must stay clear and responsible.",
      solution: "Frame the project around NLP-assisted extraction, workflow support, and explainability rather than overclaiming medical automation.",
      built: "A case structure for NLP pipeline context, AI/cloud tools, research framing, screenshots, limitations, and learnings.",
      workflow: [
        "Collect or describe safety-report text inputs.",
        "Use NLP/BioBERT-style processing to identify useful signals.",
        "Connect cloud AI tooling or Vertex AI context where relevant.",
        "Present outputs responsibly with limitations and review context."
      ],
      challenges:
        "This project needs careful language because medical and pharmacovigilance topics are high-stakes. The case should show research exposure and technical learning without unsafe claims.",
      learnings: "This is a strong progressive signal when positioned as responsible AI/NLP research and implementation exposure.",
      screenshots: [
        { title: "NLP workflow", caption: "Input text, extraction, or classification flow." },
        { title: "AI/cloud context", caption: "Vertex AI or pipeline setup view." },
        { title: "Responsible output", caption: "Result presentation with limitations and review notes." }
      ],
      faqs: [
        {
          question: "Should this make medical claims?",
          answer: "No. Keep it as research and workflow support, with clear limitations and human review framing."
        },
        { question: "What should be shown?", answer: "Pipeline diagram, screenshots, repo/demo, and what you personally implemented." },
        { question: "Why include it?", answer: "It proves AI/NLP curiosity, cloud AI exposure, and responsible technical communication." }
      ]
    }
  ],
  notes: [
    {
      id: "learning-events",
      label: "Event",
      title: "Learning and tech events",
      caption: "Use photos from workshops, hackathons, talks, or meetups with a caption about the skill or idea you took forward.",
      type: "event"
    },
    {
      id: "build-log",
      label: "Build log",
      title: "Project build sessions",
      caption: "Show working screens, whiteboards, architecture sketches, debugging moments, or demo preparation.",
      type: "build"
    },
    {
      id: "demos",
      label: "Demo",
      title: "Demos and walkthroughs",
      caption: "Connect YouTube/project demo uploads to the work, not to a generic social button.",
      type: "demo"
    },
    {
      id: "ai-learning",
      label: "Research",
      title: "AI and Python learning",
      caption: "Use this for benchmark notes, NLP/Vertex AI work, automation experiments, and things that show momentum.",
      type: "research"
    }
  ],
  skills: {
    primaryTitle: "AI, ML, and Python",
    primaryDescription: "Practical intelligence work: automation, APIs, inference scripts, dashboards, and NLP research exposure.",
    primaryRows: [
      ["Python", "automation scripts, inference workflows, FastAPI services, data handling"],
      ["AI tooling", "OpenAI SDK, Vertex AI, agentic reasoning, benchmark automation"],
      ["ML/NLP exposure", "BioBERT, pharmacovigilance research, text-processing workflows"],
      ["Data logic", "SQL, PostgreSQL, MySQL, dashboards, business intelligence ideas"]
    ],
    secondaryTitle: "Web engineering",
    secondaryRows: [
      ["Frontend", "React, TypeScript, JavaScript, React Flow, responsive UI, forms"],
      ["Backend", "Java 21, Spring Boot, FastAPI, REST APIs, WebSockets"],
      ["Delivery", "Git, GitHub, Docker, Bash, GCP, debugging, documentation"],
      ["Integrations", "WhatsApp workflows, webhooks, API connections, automation"]
    ]
  },
  experience: [
    {
      when: "Jun 2025 - Dec 2025",
      title: "Software Engineer Trainee - theprintSpace",
      summary: "Web applications, API integration, debugging, deployment support, and frontend/backend collaboration."
    },
    {
      when: "Jan 2025 - May 2025",
      title: "Software Engineer Trainee - PrimeBeds",
      summary: "Responsive UI, lifecycle work, repository management, requirements analysis, and implementation support."
    },
    {
      when: "Expected 2027",
      title: "B.Tech Computer Science - University of Lucknow",
      summary: "Coursework includes algorithms, distributed systems, and cloud infrastructure."
    }
  ]
};
