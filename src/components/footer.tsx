import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="py-24 px-4 text-center bg-gray-100 dark:bg-zinc-900 text-foreground">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight">Ready to transform your business?</h2>
            <div className="flex flex-col items-center gap-6">
                 <Link 
                    href="#" 
                    className="bg-foreground text-background px-12 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform duration-300 shadow-lg"
                 >
                    Let’s Talk
                 </Link>
                 <p className="text-gray-500 text-lg">Get a free 30-minute consultation.</p>
            </div>
            
            <div className="mt-32 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
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


