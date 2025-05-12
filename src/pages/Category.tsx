import { CategorySelection } from '../components/home/CategorySelection';

export const Category = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Select Category</h1>
      <CategorySelection />
    </div>
  );
};