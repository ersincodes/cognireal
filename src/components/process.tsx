export default function Process() {
  const steps = [
    { title: "Discovery", desc: "We analyze your business, workflows, and goals." },
    { title: "Design", desc: "We structure the right UX, architecture, and system." },
    { title: "Development", desc: "Full implementation with modern technologies." },
    { title: "Launch & Support", desc: "Training, adjustments, and long-term support." }
  ];

  return (
    <section className="relative z-10 py-24 px-4 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold mb-20 italic">Our process</h2>
      
      <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 md:ml-0 md:border-l-0 md:grid md:grid-cols-4 md:gap-8">
         {steps.map((step, i) => (
           <div key={i} className="mb-12 md:mb-0 ml-8 md:ml-0 relative group">
              {/* Dot for mobile timeline */}
              <div className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 md:hidden group-hover:bg-foreground transition-colors"></div>
              
              <div className="md:border-t-2 md:border-gray-200 md:dark:border-gray-800 md:pt-8 relative transition-all duration-300">
                 {/* Dot for desktop timeline */}
                 <div className="hidden md:block absolute -top-[9px] left-0 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-foreground transition-colors"></div>
                 
                 <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-500 transition-colors">Step {i + 1}: {step.title}</h3>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
           </div>
         ))}
      </div>
    </section>
  );
}


