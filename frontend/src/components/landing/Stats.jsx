const StatsSection = () => {
  const stats = [
    { number: "2,500+", label: "Successful Adoptions" },
    { number: "500+", label: "Verified Veterinarians" },
    { number: "1,200+", label: "Foster Homes" },
    { number: "10,000+", label: "Happy Pet Parents" }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-purple-200 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
