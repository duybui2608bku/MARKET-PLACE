import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Shield,
  Star,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Kết nối nhanh chóng",
      description: "Tìm kiếm và kết nối với hàng nghìn người làm việc chuyên nghiệp trong khu vực của bạn",
    },
    {
      icon: Shield,
      title: "An toàn & Bảo mật",
      description: "Hệ thống xác minh danh tính và đánh giá minh bạch giúp bạn an tâm",
    },
    {
      icon: Star,
      title: "Đánh giá chất lượng",
      description: "Hệ thống review và rating từ cộng đồng giúp bạn chọn lựa tốt nhất",
    },
    {
      icon: Briefcase,
      title: "Đa dạng dịch vụ",
      description: "Từ làm vườn, sửa chữa đến chăm sóc, mọi dịch vụ bạn cần đều có",
    },
  ];

  const categories = [
    { name: "Làm vườn", count: "150+ workers", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { name: "Sửa chữa", count: "200+ workers", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { name: "Chăm sóc", count: "120+ workers", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    { name: "Vệ sinh", count: "180+ workers", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
    { name: "Xây dựng", count: "90+ workers", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    { name: "Vận chuyển", count: "110+ workers", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  ];

  const steps = [
    {
      number: "1",
      title: "Tạo tài khoản",
      description: "Đăng ký miễn phí và tạo hồ sơ của bạn",
    },
    {
      number: "2",
      title: "Tìm kiếm",
      description: "Duyệt qua danh sách workers hoặc đăng công việc",
    },
    {
      number: "3",
      title: "Kết nối",
      description: "Liên hệ và thỏa thuận điều kiện làm việc",
    },
    {
      number: "4",
      title: "Hoàn thành",
      description: "Công việc được hoàn tất, đánh giá và thanh toán",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5">
              <TrendingUp className="w-3 h-3 mr-1.5" />
              Nền tảng kết nối #1 tại Việt Nam
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Tìm kiếm người làm việc
              <span className="text-primary block mt-2">chuyên nghiệp</span>
              gần bạn
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Kết nối nhanh chóng với hàng nghìn workers có kỹ năng chuyên môn cao.
              Từ làm vườn, sửa chữa đến chăm sóc - mọi dịch vụ bạn cần.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="text-base shadow-lg hover:shadow-xl transition-all">
                <Link href="/register">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/workers">
                  <Search className="mr-2 h-4 w-4" />
                  Tìm kiếm workers
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 w-full max-w-2xl">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Workers</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">Công việc</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">Đánh giá</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Danh mục dịch vụ</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá các dịch vụ phổ biến với hàng trăm workers sẵn sàng phục vụ
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/workers?category=${category.name}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${category.color}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tại sao chọn chúng tôi?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nền tảng được thiết kế để mang lại trải nghiệm tốt nhất cho cả workers và employers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cách thức hoạt động</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chỉ với 4 bước đơn giản, bạn có thể kết nối với workers phù hợp
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-lg opacity-90">
              Tham gia cùng hàng nghìn người dùng đang sử dụng nền tảng của chúng tôi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" variant="secondary" className="text-base">
                <Link href="/register">
                  Đăng ký làm Worker
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/register">
                  Tìm kiếm Workers
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
