const colors = ['A', 'B', 'C', 'D']
const all_pokers = []
const weight_mapping = {
  'royal_flush': 10,
  'straight_flush': 9,
  '41': 8,
  '32': 7,
  'flush': 6,
  'straight': 5,
  '311': 4,
  '221': 3,
  '2111': 2,
  '11111': 1,
}

for (const color of colors) {
  const nums = Object.keys(new Array(15).fill(null)).slice(2)
  for (const num of nums) all_pokers.push([+num, color, num + color])
}

Array.prototype.reverse_sort = function () {
  return this.sort((a, b) => Number(b) - Number(a))
}

function check_pokers(pokers) {
  const types_mapping = {}
  const nums = pokers.map(p => +p[0]).reverse_sort()

  const unique_nums = Array.from(new Set(nums)).reverse_sort()

  const straight = check_straight(unique_nums)
  if (straight) types_mapping.straight = straight

  const color_mapping = {}
  for (const poker of pokers) {
    if (color_mapping[poker[1]] == null) color_mapping[poker[1]] = [poker[0]]
    else color_mapping[poker[1]].push(poker[0])
  }
  for (const color of Object.keys(color_mapping)) {
    const cards = color_mapping[color]
    if (cards.length > 4) {
      const flushes = cards.reverse_sort()
      types_mapping.flushs = flushes
      types_mapping.flush = flushes.slice(0, 5)
      break
    }
  }

  const flushes = types_mapping.flushs
  if (flushes) {
    const straight = check_straight(flushes)
    if (straight) types_mapping.straight_flush = straight
  }

  if (types_mapping.straight_flush && types_mapping.straight_flush.indexOf(14) !== -1) {
    types_mapping.royal_flush = types_mapping.straight_flush
  }

  const mapping = {}
  let temp_cards = []
  for (const num of nums) {
    mapping[num] = mapping[num] == null ? 1 : mapping[num] + 1
  }

  const selected_mapping = {}
  for (const [k, v] of Object.entries(mapping)) {
    const same_cards = new Array(v).fill(+k)
    selected_mapping[v] = selected_mapping[v] == null ? same_cards : selected_mapping[v].concat(same_cards)
  }
  const keys = Object.keys(selected_mapping).reverse_sort()
  keys.forEach(key => temp_cards.push(...selected_mapping[key].reverse_sort()))
  temp_cards = temp_cards.slice(0, 5)
  const mapping_2 = {}
  for (const card of temp_cards) {
    mapping_2[card] = mapping_2[card] == null ? 1 : mapping_2[card] + 1
  }
  types_mapping[Object.values(mapping_2).reverse_sort().join('')] = temp_cards

  let weight = 0
  let type
  let cards

  const types = Object.keys(types_mapping)
  for (const each_type of types) {
    if (weight_mapping[each_type] && weight_mapping[each_type] > weight) {
      weight = weight_mapping[each_type]
      type = each_type
      cards = types_mapping[type]
    }
  }

  return {type, cards, weight}

  function check_straight(nums) {
    if (nums.join('').indexOf('5432') !== -1 && nums.indexOf(14) !== -1 && nums.indexOf(6) === -1) return [5, 4, 3, 2, 1]
    let continues = 0
    let next
    for (let i = 0; next = nums[i + 1]; i++) {
      continues = nums[i] - next === 1 ? continues + 1 : 0
      if (continues === 4) return [next + 4, next + 3, next + 2, next + 1, next]
    }
  }

}

function random_gen(count = 7, excludes = [],) {
  const pokers = Array.from(all_pokers)
  const selected = []
  let i = count
  while (i) {
    const index = Math.floor(Math.random() * pokers.length)
    const poker = pokers.splice(index, 1)[0]
    if (excludes.indexOf(poker[2]) === -1) {
      selected.push(poker)
      i--
    }
  }
  return selected
}

function simulate(players, count) {

  const total = 10000
  const start = Date.now()

  const data = []
  const excludes = []
  let id = 0
  while (id < count) {
    const poker_combination = players[id]
    data[id] = {id, pokers: [], ratio: null, win: 0}
    if (poker_combination) {
      const pokers = poker_combination.split(',')
      for (const poker of pokers) {
        const color = poker.slice(-1)
        const num = poker.slice(0, poker.length - 1)
        const comb = num.toString() + color
        data[id].pokers.push([num, color, comb])
        excludes.push(comb)
      }
    }
    id++
  }

  let i = total
  while (i--) {
    const copied = JSON.parse(JSON.stringify(data))
    const length = 2 * count - excludes.length + 5
    const random_pokers = random_gen(length, excludes)
    const public_pokers = random_pokers.splice(0, 5)
    for (const item of copied) {
      const missing_count = 2 - item.pokers.length
      if (missing_count > 0) {
        const pokers = random_pokers.splice(0, missing_count)
        item.pokers = item.pokers.concat(pokers)
      }
      const result = check_pokers(public_pokers.concat(item.pokers))
      Object.assign(copied[item.id], result)
    }
    copied.sort(function (p1, p2) {
      if (p1.weight === p2.weight) {
        const num1 = Number(p1.cards.join(''))
        const num2 = Number(p2.cards.join(''))
        return num2 - num1
      }
      return p2.weight - p1.weight
    })
    data[copied[0].id].win++
  }
  data.forEach(d => d.ratio = d.win / total)
  console.log(data)
  console.log(`Used ${(Date.now() - start) / 1000} s`)

}

function calc() {
  const total = 100000
  let i = total
  const types = {}
  while (i--) {
    const pokers = random_gen()
    const {type} = check_pokers(pokers)
    types[type] = types[type] == null ? 1 : types[type] + 1
  }

  const keys = Object.keys(types)
  for (const type of keys) {
    const p = types[type] / total
    console.log(type, p)
  }
}

// simulate(['14A,14B', '11A,10B', '2C,2D'], 3)
simulate(['14A,14B', '11A,10B'], 2)
// simulate(['14A,14B',], 9)
// calc()
