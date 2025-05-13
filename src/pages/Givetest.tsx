import { CategorySelection } from '../components/home/CategorySelection';

const Home = () => {
  return (
    <div className="p-4 sm:p-6 bg-gray-200 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow w-full max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">Select Category</h1>
        <CategorySelection />
      </div>
    </div>
  );
};

export default Home;