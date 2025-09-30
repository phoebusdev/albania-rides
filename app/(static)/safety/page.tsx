import Card from '@/components/ui/Card'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Safety Tips</h1>

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">
              🚨 Important: AlbaniaRides is a Connection Platform Only
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We facilitate connections between drivers and passengers. We are NOT responsible
              for any issues that occur during or after the ride, including but not limited to:
              accidents, theft, disputes about payment, or any other incidents. All transactions
              and arrangements are between users directly.
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span>👤</span> For Passengers
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Check driver's rating and number of completed rides before booking</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Share trip details with family or friends</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Verify the driver's car model and color match the profile</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Agree on pickup location in a public, well-lit area</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Trust your instincts - if something feels wrong, don't get in</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Prepare exact cash amount before the trip</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Keep your phone charged and available during the trip</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span>🚗</span> For Drivers
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Ensure your vehicle is in good condition and safe to drive</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Keep your car insurance and registration current</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Verify passenger identity when picking them up</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Follow all traffic laws and drive safely</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Don't drive if you're tired or under the influence</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Be clear about payment amount and method before departure</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Respect passenger boundaries and privacy</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span>💵</span> About Cash Payments
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>All payments are made directly in cash between driver and passenger</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>AlbaniaRides does NOT process any payments</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Agree on the exact amount before the trip starts</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Payment disputes are between users - platform is not responsible</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Bring exact change when possible</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span>🚩</span> Red Flags - Cancel If:
              </h3>
              <ul className="space-y-2 text-red-600 font-medium">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Driver/passenger has no ratings or very low ratings</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Driver asks to change pickup location to isolated area</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Driver's car doesn't match the description</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Driver appears intoxicated or unsafe</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Driver asks for payment upfront or through the app</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Someone makes you feel uncomfortable in any way</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span>⚠️</span> In Case of Emergency
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Police: 129</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Ambulance: 127</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Fire: 128</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Keep these numbers saved in your phone</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">
                📱 Report Inappropriate Behavior
              </h3>
              <p className="text-gray-700 mb-3">
                If another user behaves inappropriately, please report them through their profile.
                We review all reports and may suspend accounts with multiple verified complaints.
              </p>
              <p className="text-gray-700">
                However, remember: AlbaniaRides only facilitates connections. For legal issues,
                accidents, or crimes, contact the appropriate authorities directly.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}