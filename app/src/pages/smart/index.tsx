import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './index.scss'

export default function SmartTool() {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])

  const addIngredient = () => {
    if (inputValue.trim()) {
      setIngredients([...ingredients, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }

  const handleSearch = async () => {
    if (ingredients.length === 0) return

    try {
      const res = await Taro.request({
        url: 'http://localhost:3000/smart/recommend',
        method: 'POST',
        data: { ingredients }
      })
      setResults(res.data)
    } catch (err) {
      Taro.showToast({ title: 'Search failed', icon: 'none' })
    }
  }

  return (
    <View className='smart-container'>
      <View className='input-section'>
        <Text className='label'>输入你现有的食材：</Text>
        <View className='input-row'>
          <Input
            className='input'
            placeholder='例如: 鸡蛋'
            value={inputValue}
            onInput={e => setInputValue(e.detail.value)}
            onConfirm={addIngredient}
          />
          <Button size='mini' onClick={addIngredient}>添加</Button>
        </View>

        <View className='tags'>
          {ingredients.map((ing, i) => (
            <View key={i} className='tag'>
              <Text>{ing}</Text>
              <Text className='close' onClick={() => removeIngredient(i)}>×</Text>
            </View>
          ))}
        </View>

        <Button className='search-btn' onClick={handleSearch} disabled={ingredients.length === 0}>
          开始匹配
        </Button>
      </View>

      <ScrollView scrollY className='result-list'>
        {results.map(recipe => (
          <View key={recipe.id} className='recipe-card'>
            <View className='info'>
              <Text className='title'>{recipe.title}</Text>
              <Text className='match-info'>
                匹配 {recipe.matchCount} 项 / 缺 {recipe.missingCount} 项
              </Text>
            </View>
            <Button size='mini' className='detail-btn'>查看</Button>
          </View>
        ))}
        {results.length === 0 && ingredients.length > 0 && (
          <View className='empty-hint'>点击搜索查看推荐结果</View>
        )}
      </ScrollView>
    </View>
  )
}

