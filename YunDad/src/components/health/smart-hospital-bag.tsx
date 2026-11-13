"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { hospitalBagList } from '@/lib/weekly-data'
import { useUserStore } from '@/store/user-store'

export function SmartHospitalBag() {
  const { user } = useUserStore()
  const dueDate = user?.dueDate ? (typeof user.dueDate === 'string' ? new Date(user.dueDate) : user.dueDate) : null
  const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1e3 * 60 * 60 * 24)) : null
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [expandedCategory, setExpandedCategory] = useState<string | null>('妈妈用品')

  const totalItems = Object.values(hospitalBagList).flat().length
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0

  const toggle = (name: string) => setCheckedItems(p => ({ ...p, [name]: !p[name] }))
  const getCatProg = (cat: string) => {
    const items = hospitalBagList[cat as keyof typeof hospitalBagList] || []
    if (!items.length) return 0
    return (items.filter(i => checkedItems[i.name]).length / items.length) * 100
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          待产包 👜
          {daysUntil !== null && (
            <Badge variant={daysUntil <= 14 ? 'destructive' : daysUntil <= 30 ? 'default' : 'outline'}>
              {daysUntil > 0 ? `${daysUntil}天后` : '已足月'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>准备进度</span><span>{checkedCount}/{totalItems}</span></div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {Object.keys(hospitalBagList).map(cat => (
            <button key={cat} onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
              className={`flex-1 min-w-fit px-3 py-1.5 rounded-full text-xs transition-colors ${expandedCategory === cat ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {cat} {getCatProg(cat) === 100 ? '✅' : ''}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {Object.entries(hospitalBagList).map(([cat, items]) => (
            <div key={cat} className={expandedCategory === cat ? 'block' : 'hidden'}>
              <div className="font-medium text-sm text-foreground mb-2">{cat}</div>
              <div className="space-y-1">
                {(items as {name: string; required?: boolean; quantity?: number}[]).map(item => (
                  <div key={item.name} className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${checkedItems[item.name] ? 'bg-green-50 dark:bg-green-950' : 'bg-muted'}`}>
                    <Checkbox checked={checkedItems[item.name] || false} onCheckedChange={() => toggle(item.name)} />
                    <span className={`flex-1 text-sm ${checkedItems[item.name] ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                    {item.required && <Badge variant="outline" className="text-10">必选</Badge>}
                    {item.quantity && item.quantity > 1 && <Badge variant="secondary" className="text-10">x{item.quantity}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {daysUntil !== null && daysUntil <= 14 && progress < 100 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-xl text-xs text-orange-700 dark:text-orange-300">⚠️ 距离预产期不足2周，抓紧准备！</div>
        )}
      </CardContent>
    </Card>
  )
}