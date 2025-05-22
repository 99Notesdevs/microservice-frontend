// import { CategorySelection } from '../components/home/CategorySelection';
import { motion } from 'framer-motion';

const Home = () => {
   return (
     <div className="p-8 sm:p-12 bg-gradient-to-b from-orange-50 to-orange-100 min-h-screen flex flex-col items-center justify-center">
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-2xl border border-orange-100"
       >
         <motion.h1 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="text-3xl sm:text-4xl font-bold mb-6 text-orange-700 text-center tracking-tight"
         >
           Select Your Category
         </motion.h1>
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.3 }}
         >
           {/* <CategorySelection 
             onSelectionChange={(selectedCategories) => {
               const params = new URLSearchParams({
                 categoryIds: selectedCategories.join(','),
                 limit: '10',
                 timeLimit: '30',
                 negativeMarking: 'false'
               });
               window.location.href = `/testPortal?${params.toString()}`;
             }} 
           /> */}
         </motion.div>
       </motion.div>
     </div>
   );
};

export default Home;