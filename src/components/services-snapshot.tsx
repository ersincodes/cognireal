export default function ServicesSnapshot() {
  return (
    <section className="relative z-10 py-24 px-4 md:px-12 lg:px-24 bg-white dark:bg-zinc-900 text-foreground">
      <h2 className="text-4xl md:text-5xl font-bold mb-20 text-gray-900 dark:text-white">
        In a snapshot, we ...
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
        {/* Column 1 */}
        <div className="group">
          <h3 className="text-2xl font-bold border-b-2 border-gray-200 dark:border-gray-700 pb-6 mb-6 group-hover:border-foreground transition-colors duration-300 text-gray-900 dark:text-white">
            Design
          </h3>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Build modern, fast, mobile-ready websites for businesses that want
            to look professional.
          </p>
        </div>

        {/* Column 2 */}
        <div className="group">
          <h3 className="text-2xl font-bold border-b-2 border-gray-200 dark:border-gray-700 pb-6 mb-6 group-hover:border-foreground transition-colors duration-300 text-gray-900 dark:text-white">
            Build Tools
          </h3>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Custom web tools to optimize operations, automate workflows, and
            bring clarity to your processes.
          </p>
        </div>

        {/* Column 3 */}
        <div className="group">
          <h3 className="text-2xl font-bold border-b-2 border-gray-200 dark:border-gray-700 pb-6 mb-6 group-hover:border-foreground transition-colors duration-300 text-gray-900 dark:text-white">
            Integrate AI
          </h3>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Integrate AI into your daily workflows—automated reports,
            intelligent chatbots, and custom automation systems to upgrade how
            your business works.
          </p>
        </div>
      </div>
    </section>
  );
}
