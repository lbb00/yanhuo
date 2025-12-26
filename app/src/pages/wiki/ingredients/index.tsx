import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'

export default function WikiIndex() {
  const [ingredients, setIngredients] = useState<any[]>([])
  const [query, setQuery] = useState('')

  const fetchIngredients = async (q = '') => {
    try {
      const res = await Taro.request({
        url: `http://localhost:3000/wiki/ingredients?q=${q}`,
        method: 'GET'
      })
      setIngredients(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useLoad(() => {
    fetchIngredients()
  })

  return (
    <View className='wiki-container'>
      <View className='search-bar'>
        <Input
          placeholder='搜索食材...'
          value={query}
          onInput={(e) => setQuery(e.detail.value)}
          onConfirm={() => fetchIngredients(query)}
        />
        <Button size='mini' onClick={() => fetchIngredients(query)}>搜索</Button>
      </View>

      <View className='list'>
        {ingredients.map(item => (
          <View key={item.id} className='item' onClick={() => console.log('Go to detail', item.id)}>
            <Text className='name'>{item.name}</Text>
            <Text className='category'>{item.category}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

