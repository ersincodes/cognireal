import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="relative z-10 py-12 px-4 text-center bg-gray-100 dark:bg-zinc-900 text-foreground mt-auto">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">Ready to transform your business?</h2>
            <div className="flex flex-col items-center gap-6">
                 <Link 
                    href="#" 
                    className="bg-foreground text-background px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-lg"
                 >
                    Let’s Talk
                 </Link>
                 <p className="text-gray-500 text-base">Get a free 30-minute consultation.</p>
            </div>
            
            <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} HoloBit. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-foreground transition-colors">LinkedIn</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Instagram</Link>
                </div>
            </div>
        </div>
    </footer>
  );
}


