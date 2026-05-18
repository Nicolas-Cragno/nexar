import "./css/Banner.css";

const Banner = ({ title, img, logo }) => {
  return (
    <div
      className="banner"
      style={{
        backgroundImage: `url(${img})`,
      }}
    >
      <div className="banner-footer">
        <h1 className="banner-logo-box">
          <img src={logo} alt="" className="banner-logo" />
          {title.toUpperCase()}
        </h1>
      </div>
    </div>
  );
};

export default Banner;
