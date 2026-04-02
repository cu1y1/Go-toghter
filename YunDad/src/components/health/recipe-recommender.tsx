"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { foodNutrition, tabooFoods } from '@/lib/weekly-data'
import { CardSkeleton, ErrorMessage } from '@/lib/use-async'

interface Recipe { id: string; name: string; mealType: string; rating: number; tags?: string }

export function RecipeRecommender({ pregnancyWeek }: { pregnancyWeek: number }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [activeTab, setActiveTab] = useState<'recommend' | 'nutrition' | 'taboo'>('recommend')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/recipes?isRecommended=true`)
        const data = await res.json()
        if (data.success) setRecipes(data.data)
        else setError(data.error)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [pregnancyWeek])

  const getTrimester = (w: number) => w <= 12 ? '孕早期' : w <= 28 ? '孕中期' : '孕晚期'
  const advice: Record<string, string[]> = {
    '孕早期': ['补充叶酸', '清淡易消化', '少食多餐'],
    '孕中期': ['增加蛋白质', '补钙', '铁'],
    '孕晚期': ['控制盐分', '补充胶原蛋白', '少食多餐'],
  }

  if (loading) return <CardSkeleton />
  if (error) return <Card><ErrorMessage message={error} /></Card>

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">食谱推荐 🍽️</CardTitle>
        <div className="flex gap-2 mt-2">
          {(['recommend', 'nutrition', 'taboo'] as const).map(tab => (
            <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(tab)}>
              {tab === 'recommend' ? '推荐' : tab === 'nutrition' ? '营养' : '忌口'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-xl">
          <div className="text-sm font-medium mb-2">{getTrimester(pregnancyWeek)}饮食建议</div>
          <div className="flex flex-wrap gap-1">{advice[getTrimester(pregnancyWeek)].map(i => <Badge key={i} variant="secondary">{i}</Badge>)}</div>
        </div>
        {activeTab === 'recommend' && (
          recipes.length === 0 ? <div className="text-center py-4 text-muted-foreground">暂无推荐</div> :
          <div className="space-y-2">{recipes.slice(0,5).map(r => (
            <div key={r.id} className="flex items-center gap-3 p-2 border rounded-xl">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center text-xl">🍳</div>
              <div className="flex-1"><div className="font-medium text-sm">{r.name}</div><div className="text-xs text-muted-foreground">{r.mealType}</div></div>
              <Badge variant="outline">⭐ {r.rating}</Badge>
            </div>
          ))}</div>
        )}
        {activeTab === 'nutrition' && (
          <div className="grid grid-cols-2 gap-2">{Object.entries(foodNutrition).slice(0,6).map(([n,i]) => (
            <div key={n} className="p-2 bg-amber-50 dark:bg-amber-950 rounded-xl">
              <div className="font-medium text-sm">{n}</div><div className="text-xs text-muted-foreground">{i.calories}千卡</div>
              <div className="flex flex-wrap gap-1 mt-1">{i.goodFor.slice(0,2).map(it => <Badge key={it} variant="outline" className="text-10">{it}</Badge>)}</div>
            </div>
          ))}</div>
        )}
        {activeTab === 'taboo' && (
          <div className="space-y-2">{tabooFoods.map((f,i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-xl">
              <span className={f.severity==='critical'?'text-red-600':'text-orange-500'}>{f.severity==='critical'?'🚫':'⚠️'}</span>
              <div className="flex-1"><div className="font-medium text-sm">{f.name}</div><div className="text-xs text-muted-foreground">{f.reason}</div></div>
            </div>
          ))}</div>
        )}
      </CardContent>
    </Card>
  )
}