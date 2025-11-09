import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Clock, 
  Shield, 
  Star, 
  MapPin, 
  Smartphone,
  ChevronRight,
  Package,
  Users,
  TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  // Features
  const features = [
    {
      icon: Truck,
      title: "Giao hàng bằng Drone",
      description: "Công nghệ drone hiện đại, giao hàng nhanh chóng trong vòng 15-20 phút",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      title: "Siêu tốc độ",
      description: "Đặt hàng và nhận món trong thời gian ngắn nhất, không lo kẹt xe",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "An toàn & Vệ sinh",
      description: "Đảm bảo vệ sinh thực phẩm, không tiếp xúc trực tiếp",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Star,
      title: "Chất lượng đỉnh cao",
      description: "Hợp tác với các nhà hàng uy tín, món ăn ngon đảm bảo",
      color: "from-orange-500 to-red-500"
    }
  ];

  // Stats
  const stats = [
    { icon: Users, value: "10,000+", label: "Khách hàng" },
    { icon: Package, value: "50,000+", label: "Đơn hàng" },
    { icon: MapPin, value: "100+", label: "Nhà hàng" },
    { icon: TrendingUp, value: "98%", label: "Hài lòng" }
  ];

  // Categories
  const categories = [
    { emoji: "🍔", name: "Burger", color: "bg-yellow-100 hover:bg-yellow-200" },
    { emoji: "🍕", name: "Pizza", color: "bg-red-100 hover:bg-red-200" },
    { emoji: "🍜", name: "Phở", color: "bg-orange-100 hover:bg-orange-200" },
    { emoji: "🍱", name: "Cơm", color: "bg-green-100 hover:bg-green-200" },
    { emoji: "🍰", name: "Bánh ngọt", color: "bg-pink-100 hover:bg-pink-200" },
    { emoji: "☕", name: "Đồ uống", color: "bg-blue-100 hover:bg-blue-200" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Truck className="w-4 h-4" />
                Công nghệ giao hàng mới nhất
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Giao hàng
                </span>
                <br />
                <span className="text-gray-800">bằng Drone 🚁</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Trải nghiệm công nghệ giao hàng tương lai. Đặt món yêu thích, 
                nhận trong 15 phút với drone siêu tốc!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/restaurants')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <span>Đặt món ngay</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 border-2 border-gray-200"
                >
                  Xem thực đơn
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">15'</div>
                  <div className="text-sm text-gray-600">Giao hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">100+</div>
                  <div className="text-sm text-gray-600">Nhà hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">24/7</div>
                  <div className="text-sm text-gray-600">Phục vụ</div>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-white rounded-2xl p-6 transform -rotate-3">
                    <div className="text-center">
                      <div className="text-8xl mb-4">🚁</div>
                      <div className="text-6xl mb-4">📦</div>
                      <div className="text-4xl">🍔 🍕 🍜</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-10 -left-10 bg-yellow-400 rounded-full p-4 shadow-lg animate-bounce">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="absolute bottom-10 -right-10 bg-pink-400 rounded-full p-4 shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                <span className="text-3xl">💨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600">
              Trải nghiệm dịch vụ giao hàng hiện đại nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
              <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Danh mục món ăn
              </h2>
              <p className="text-xl text-gray-600">
                Khám phá hàng trăm món ăn ngon từ nhiều nhà hàng
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className={`${cat.color} rounded-2xl p-6 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-xl cursor-default`}
                >
                  <div className="text-5xl mb-3">{cat.emoji}</div>
                  <div className="font-semibold text-gray-800">{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>


      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center text-white">
                  <Icon className="w-12 h-12 mx-auto mb-4 opacity-80" />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-gray-600">
              Chỉ với 3 bước đơn giản
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Chọn món", desc: "Tìm nhà hàng và món ăn yêu thích", emoji: "🍔" },
              { step: "2", title: "Đặt hàng", desc: "Xác nhận đơn hàng và thanh toán", emoji: "💳" },
              { step: "3", title: "Nhận hàng", desc: "Drone giao tận nơi trong 15 phút", emoji: "🚁" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-5xl">{item.emoji}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Sẵn sàng đặt món?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Hàng trăm nhà hàng đang chờ bạn khám phá. Đặt món ngay và nhận ưu đãi cho đơn đầu tiên!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/restaurants')}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Smartphone className="w-6 h-6" />
                <span>Bắt đầu ngay</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm">An toàn</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Nhanh chóng</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm">Chất lượng</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}