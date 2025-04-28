import { GiveawayPicker } from "@/components/giveaway-picker"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 min-h-[calc(100vh-40px)]">
      <h1 className="text-3xl font-bold text-center mb-8">Giveaway Winner Picker</h1>
      <GiveawayPicker />
    </main>
  )
}
