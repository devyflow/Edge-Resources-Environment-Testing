import { ArrowUpRight, Plus, MessageSquare } from "lucide-react";
import s from "./project-details.module.css";

export default function ProjectQuestions({ name, questions, sourceUrl, liveUrl }: { name: string; questions: { question: string; answer: string }[]; sourceUrl: string; liveUrl: string }) {
  return <section id="questions" className={s.questions}>
    <header className={s.questionsHeader}><div><span className={s.eyebrow}>PROJECT NOTES / {name.toUpperCase()}</span><h2>A closer look</h2></div><MessageSquare size={28} strokeWidth={1.3} /></header>
    <div className={s.questionsBody}><aside className={s.questionsAside}><span className={s.questionCount}>{String(questions.length).padStart(2, "0")}</span><p>Decisions, implementation,<br />and practical limits.</p>{(sourceUrl || liveUrl) && <a href={sourceUrl || liveUrl}>{sourceUrl ? "Explore the source" : "Try the project"}<ArrowUpRight size={16} /></a>}</aside>
      <div className={s.answers}>{questions.map((item, index) => <details key={item.question} open={index === 0}><summary><span className={s.number}>{String(index + 1).padStart(2, "0")}</span><span>{item.question}</span><Plus size={18} /></summary><p>{item.answer}</p></details>)}</div>
    </div>
  </section>;
}
