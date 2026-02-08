import { GraduationCap, CheckCircle, Shield, Lightbulb } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-green-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-green-800" />
          <span className="text-xl font-semibold text-gray-900">ScholarCheck</span>
        </div>
        <button className="bg-green-800 text-white px-6 py-2 rounded-md hover:bg-green-900 transition-colors font-medium">
          Login
        </button>
      </header>

      <section className="bg-green-50 px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ScholarCheck
          </h1>
          <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            ScholarCheck is your easy-to-use scholarship eligibility platform. Quickly
            verify which scholarships you qualify for, track your requirements, and
            manage your progress in one secure place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-green-800 px-8 py-3 rounded-md border-2 border-green-800 hover:bg-green-50 transition-colors font-medium">
              Learn More
            </button>
            <button className="bg-green-800 text-white px-8 py-3 rounded-md hover:bg-green-900 transition-colors font-medium">
              Get Started
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect<br />Scholarship Match
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our intelligent system helps students discover scholarships they qualify
              for, while providing administrators with powerful tools to manage and
              distribute opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-50 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-green-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Eligibility Check
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Check AI eligibility checks are securely recorded and timestamped for
                maximum transparency and eligibility.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <Shield className="w-8 h-8 text-green-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Blockchain Verified
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Checks AI eligibility checks are securely recorded and timestamped for
                maximum transparency and eligibility.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <Lightbulb className="w-8 h-8 text-green-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Guidance
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Get personalized assistance from our AI chatbot to understand requirements and
                optimize your applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            © 2026 ScholarCheck. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
