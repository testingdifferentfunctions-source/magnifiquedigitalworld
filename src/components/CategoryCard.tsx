import { Link } from "react-router-dom";
import { Category } from "@/data/articles";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <Link
      to={`/section/${category.id}`}
      className="group flex flex-col items-center gap-4 cursor-pointer animate-fade-in focus:outline-none"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-border transition-all duration-300 group-hover:border-[#A67DE8] group-hover:shadow-[0_0_24px_rgba(166,125,232,0.45)] group-focus-visible:border-[#A67DE8]"
      >
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <span className="text-center font-medium text-sm md:text-base transition-colors duration-300 group-hover:text-[#A67DE8]">
        {category.name}
      </span>
    </Link>
  );
};

export default CategoryCard;
