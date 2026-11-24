import { ArrowLeft, Code2, Sparkles } from "lucide-react";
import SkillsList from "../components/SkillsList";
import "./FeaturePages.css";
import "./SkillsExplorer.css";

export default function SkillsExplorer({ onBack }) {
  return <main className="cyc-page cyc-feature-page cyc-skills-page">
    <button type="button" className="cyc-feature-back" onClick={onBack}><ArrowLeft size={18}/> Dashboard</button>
    <header className="cyc-feature-header">
      <div className="cyc-feature-heading-icon"><Code2 size={25}/></div>
      <div><span className="cyc-feature-eyebrow"><Sparkles size={14}/> DEVELOP YOUR POTENTIAL</span><h1>Skills Explorer</h1><p>Discover new skills, track your proficiency and explore learning resources.</p></div>
    </header>
    <SkillsList explorer />
  </main>;
}
