import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import s from "@/components/entry-experience.module.css";

export default function DevyFlowCase() {
  return <main className={`${s.engineer} ${s.casePage}`}>
    <header className={s.workHeader}><Link className={s.brand} href="/preview/entry">devyflow<span>.</span></Link><Link href="/preview/entry/work"><ArrowLeft size={17} />Selected work</Link></header>
    <section className={s.caseIntro}><span className={s.kicker}>FULL-STACK / PERSONAL PROJECT</span><h1>DevyFlow</h1><p>A portfolio I can update without editing the code.</p><div className={s.stack}><span>Next.js</span><span>TypeScript</span><span>Supabase</span></div><div className={s.caseLinks}><a href="https://github.com/devyflow/Edge-Resources-Environment-Testing" target="_blank" rel="noreferrer"><Github size={17} />Source code <ArrowUpRight size={15} /></a><Link href="/">Current portfolio <ArrowUpRight size={15} /></Link></div></section>
    <img className={s.caseScreenshot} src="/camera-preview/portfolio-home.png" alt="The existing DevyFlow homepage with profile, featured projects, and social links" />
    <section className={s.caseDetails}><div><span className={s.kicker}>WHAT I BUILT</span><h2>One place for the work.</h2></div><div><p>Project case pages bring screenshots, YouTube demonstrations, technical notes, and FAQs together. Content editing supports project updates, gallery images, and visibility controls.</p><p>The application uses Next.js and TypeScript, with Supabase authentication, database content, and image storage integrations.</p><p className={s.caseCaveat}>Current development note: the configured Supabase connection needs restoring. The new camera entrance is a separate design preview.</p></div></section>
    <footer className={s.workFooter}><Link href="/preview/entry/work"><ArrowLeft size={16} />Back to selected work</Link><span>More screenshots and a walkthrough will follow.</span></footer>
  </main>;
}
