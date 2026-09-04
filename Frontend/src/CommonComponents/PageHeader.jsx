import { Link } from "react-router-dom";

const PageHeader = ({ title, background = "/images/pageheader.jpg" }) => {

  return (
    <div
      className="relative flex h-[170px] w-full items-center justify-center overflow-hidden text-white sm:h-[190px] md:h-[210px]"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#17342f]/65"></div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-[#d5a65a]"></div>

      <div className="relative px-4 text-center">

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#edc783]">Q Frame Studio</p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/80 sm:text-sm">

          <Link
            to="/"
            className="transition hover:text-[#edc783]"
          >
            Home
          </Link>

          <span>/</span>

          <span className="text-white">{title}</span>

        </div>

      </div>
    </div>
  );
};

export default PageHeader;