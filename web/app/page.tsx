export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9ff] text-[#333]">
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#e0e4ff]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-extrabold text-xl text-[#2d3a8c]">DyslexAI</span>
        </div>
        <a href="https://github.com/alexisfrye/DyslexAI" className="text-sm text-[#4a90d9] hover:underline" target="_blank" rel="noopener noreferrer">
          GitHub →
        </a>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-[#eef2ff] text-[#2d3a8c] text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Chrome Extension · Free · No account needed
        </div>
        <h1 className="text-5xl font-extrabold text-[#2d3a8c] leading-tight mb-6">
          Any webpage.<br />Actually readable.
        </h1>
        <p className="text-lg text-[#555] leading-relaxed mb-10 max-w-xl mx-auto">
          DyslexAI is a browser extension for people with dyslexia, dyscalculia, and numeric anxiety.
          It lives in your browser — no copy-pasting, no switching apps, no accounts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://github.com/alexisfrye/DyslexAI" className="bg-[#2d3a8c] text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-[#1e2a6e] transition-colors" target="_blank" rel="noopener noreferrer">
            Download Extension →
          </a>
          <a href="#how-it-works" className="border border-[#d0d8ff] text-[#2d3a8c] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#eef2ff] transition-colors">
            See how it works
          </a>
        </div>
      </section>

      <section id="how-it-works" className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-[#2d3a8c] mb-12">Two modes. One goal.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard emoji="🔍" title="Lens Mode" subtitle="Passive accessibility, always on"
            features={["OpenDyslexic font on any site","Letter spacing + line height controls","Color overlay to reduce glare","Number highlighting","Click any number → dot-grid visualization"]}
            color="#eef2ff" border="#d0d8ff" />
          <FeatureCard emoji="🎓" title="Coach Mode" subtitle="AI math tutor, in your browser"
            features={["Detects word problems as you read","Hover any region → Ask Coach","Socratic or direct answer mode","Streams responses word-by-word","Works without API key (fallback Qs)"]}
            color="#f0fff4" border="#b2f5cb" />
        </div>
      </section>

      <section className="bg-white border-y border-[#e0e4ff] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-6">🔢</div>
          <h2 className="text-3xl font-bold text-[#2d3a8c] mb-4">Numbers you can actually see</h2>
          <p className="text-[#555] text-lg leading-relaxed mb-6">
            Click any number on any webpage. DyslexAI converts it into a dot-grid — groups of 5,
            color-coded by row — so you can feel the quantity, not just read the symbol.
            It also reads the number aloud via your browser&apos;s built-in speech engine.
          </p>
          <div className="flex justify-center gap-3 flex-wrap text-sm text-[#2d3a8c] font-medium">
            {["47 → dots", "Written numbers too", "Audio readout", "No limit"].map((tag) => (
              <span key={tag} className="bg-[#eef2ff] px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[#2d3a8c] mb-4">Multi-agent AI architecture</h2>
        <p className="text-center text-[#555] mb-10">Coach Mode runs four specialized Claude agents — each expert at one job.</p>
        <div className="space-y-4">
          {[
            { name: "Scanner Agent", desc: "Reads the page and classifies regions: word problems, equations, statistics." },
            { name: "Tutor Agent", desc: "Runs Socratic tutoring sessions with streaming responses. Asks one question at a time." },
            { name: "Accessibility Agent", desc: "Analyzes page content type and suggests optimal Lens Mode settings." },
            { name: "Confusion Detection", desc: "Stretch goal: uses face-api.js to detect when you look confused and proactively offer help." },
          ].map((agent) => (
            <div key={agent.name} className="flex gap-4 items-start bg-white rounded-xl p-4 border border-[#e0e4ff]">
              <div className="w-2 h-2 rounded-full bg-[#4a90d9] mt-2 flex-shrink-0" />
              <div>
                <div className="font-bold text-[#2d3a8c] text-sm">{agent.name}</div>
                <div className="text-[#666] text-sm mt-0.5">{agent.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#2d3a8c] py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Start reading better. Right now.</h2>
        <p className="text-[#c0caff] mb-8 max-w-md mx-auto">No account. No subscription. Works on every website you already visit.</p>
        <a href="https://github.com/alexisfrye/DyslexAI" className="inline-block bg-white text-[#2d3a8c] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#eef2ff] transition-colors" target="_blank" rel="noopener noreferrer">
          Get DyslexAI →
        </a>
      </section>

      <footer className="text-center py-8 text-sm text-[#aaa]">
        Built at the New England Inter-Collegiate AI Hackathon · Powered by Claude AI
      </footer>
    </main>
  );
}

function FeatureCard({ emoji, title, subtitle, features, color, border }: {
  emoji: string; title: string; subtitle: string; features: string[]; color: string; border: string;
}) {
  return (
    <div className="rounded-2xl p-6 border" style={{ background: color, borderColor: border }}>
      <div className="text-3xl mb-3">{emoji}</div>
      <div className="font-bold text-[#2d3a8c] text-xl mb-1">{title}</div>
      <div className="text-xs text-[#888] mb-4 font-medium uppercase tracking-wide">{subtitle}</div>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#444]">
            <span className="text-[#4a90d9] mt-0.5">✓</span>{f}
          </li>
        ))}
      </ul>
    </div>
  );
}
