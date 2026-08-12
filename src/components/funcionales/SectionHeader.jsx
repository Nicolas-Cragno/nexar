import "./css/SectionHeader.css";

const SectionHeader = ({ title, subtitle }) => {
  return (
    <div className="section-header">
      <div className="section-header-box">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default SectionHeader;
