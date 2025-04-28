"use client"

import { useState, useRef, useEffect } from "react"
import { X, Download, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import html2canvas from 'html2canvas-pro';

export function GiveawayPicker() {
  const [names, setNames] = useState<string[]>([])
  const [newName, setNewName] = useState("")
  const [bulkNames, setBulkNames] = useState("")
  const [winner, setWinner] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [currentlyDisplayed, setCurrentlyDisplayed] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const winnerCardRef = useRef<HTMLDivElement>(null)

  const addName = () => {
    if (newName.trim()) {
      setNames([...names, newName.trim()])
      setNewName("")
    }
  }

  const addBulkNames = () => {
    if (bulkNames.trim()) {
      const nameList = bulkNames
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      setNames([...names, ...nameList])
      setBulkNames("")
    }
  }

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index))
  }

  const selectWinner = () => {
    if (names.length === 0) return

    setIsSelecting(true)
    setWinner(null)

    // Shuffle through names for animation effect
    let counter = 0
    const shuffleSpeed = 100 // ms
    const shuffleDuration = 3000 // ms
    const totalIterations = shuffleDuration / shuffleSpeed

    intervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * names.length)
      setCurrentlyDisplayed(names[randomIndex])

      counter++
      if (counter >= totalIterations) {
        clearInterval(intervalRef.current!)
        const winnerIndex = Math.floor(Math.random() * names.length)
        setWinner(names[winnerIndex])
        setCurrentlyDisplayed(null)
        setIsSelecting(false)
      }
    }, shuffleSpeed)
  }

  const resetPicker = () => {
    setWinner(null)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsSelecting(false)
    setCurrentlyDisplayed(null)
  }

  const clearAll = () => {
    setNames([])
    resetPicker()
  }

  const downloadWinnerCard = async () => {
    if (!winnerCardRef.current || !winner) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(winnerCardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher resolution
      })

      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `winner-${winner.replace(/\s+/g, "-").toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating winner card:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single">
            <TabsList className="mb-4">
              <TabsTrigger value="single">Add Single Name</TabsTrigger>
              <TabsTrigger value="bulk">Add Multiple Names</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter a name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addName()
                  }}
                />
                <Button onClick={addName}>Add</Button>
              </div>
            </TabsContent>

            <TabsContent value="bulk">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulkNames">Enter names (one per line)</Label>
                  <Textarea
                    id="bulkNames"
                    placeholder="Uzi &#10;Tanbir&#10;"
                    value={bulkNames}
                    onChange={(e) => setBulkNames(e.target.value)}
                    rows={5}
                  />
                </div>
                <Button onClick={addBulkNames}>Add All Names</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Participants ({names.length})</CardTitle>
          {names.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {names.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No participants added yet. Add some names to get started!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {names.map((name, index) => (
                <Badge key={index} variant="secondary" className="py-2 px-3">
                  {name}
                  <X className="ml-2 h-4 w-4 cursor-pointer hover:text-destructive" onClick={() => removeName(index)} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={selectWinner} disabled={names.length === 0 || isSelecting}>
            {isSelecting ? "Selecting..." : "Pick a Winner!"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Winner</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center min-h-[200px]">
          {isSelecting && currentlyDisplayed ? (
            <div className="text-center animate-pulse">
              <h2 className="text-3xl font-bold">{currentlyDisplayed}</h2>
              <p className="text-muted-foreground mt-2">Selecting winner...</p>
            </div>
          ) : winner ? (
            <div className="text-center animate-in fade-in-50 duration-500 w-full">
              <div ref={winnerCardRef} className="winner-card relative mx-auto max-w-md p-8 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 opacity-20" />
                <div className="relative z-10 bg-card p-8 rounded-lg border shadow-lg">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-500 p-3 rounded-full">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">Congratulations!</h3>
                  <h2 className="text-3xl font-bold text-center mb-4">{winner}</h2>
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Winner of the Giveaway</p>
                    <p className="mt-1">{formattedDate}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
                    System designed by Antlers Labs
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="outline" onClick={resetPicker}>
                  Pick Again
                </Button>
                <Button onClick={downloadWinnerCard} disabled={isDownloading} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Generating..." : "Download Winner Card"}
                </Button>
              </div>
            </div>
          ) : (
            <p
              className={cn(
                "text-center text-muted-foreground",
                names.length === 0 ? "text-red-500 dark:text-red-400" : "",
              )}
            >
              {names.length === 0
                ? "Add some participants first!"
                : "Click 'Pick a Winner!' to randomly select a winner"}
            </p>
          )}
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-muted-foreground pb-4">System designed by Antlers Labs</footer>
    </div>
  )
}
