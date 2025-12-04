<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getEchartsAge, getEchartsGender } from '@/api/user'

// 图表引用
const genderChart = ref<HTMLElement>()
// const preferenceChart = ref<HTMLElement>()
const ageChart = ref<HTMLElement>()

// 图表实例
let genderChartInstance: echarts.ECharts | null = null
// let preferenceChartInstance: echarts.ECharts | null = null
let ageChartInstance: echarts.ECharts | null = null

// 初始化性别分布饼图
const genderData = ref([
  { value: 0, name: '女性' },
  { value: 0, name: '男性' }
])
const initGenderChart = () => {
  if (!genderChart.value) return
  genderChartInstance = echarts.init(genderChart.value)

  const option = {
    title: {
      text: '用户性别分布',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '性别分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: genderData.value[1].value, name: genderData.value[1].name },
          { value: genderData.value[0].value, name: genderData.value[0].name }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  genderChartInstance.setOption(option)
}

// // 初始化用户喜好饼图
// const initPreferenceChart = () => {
//   if (!preferenceChart.value) return

//   preferenceChartInstance = echarts.init(preferenceChart.value)

//   const option = {
//     title: {
//       text: '用户喜好占比',
//       left: 'center',
//       textStyle: {
//         fontSize: 16
//       }
//     },
//     tooltip: {
//       trigger: 'item',
//       formatter: '{a} <br/>{b}: {c} ({d}%)'
//     },
//     legend: {
//       orient: 'vertical',
//       left: 'left'
//     },
//     series: [
//       {
//         name: '喜好分布',
//         type: 'pie',
//         radius: '50%',
//         data: [
//           { value: 235, name: '影视' },
//           { value: 274, name: '情感' },
//           { value: 310, name: '旅游' },
//           { value: 335, name: '生活' },
//           { value: 400, name: '职场' }
//         ],
//         emphasis: {
//           itemStyle: {
//             shadowBlur: 10,
//             shadowOffsetX: 0,
//             shadowColor: 'rgba(0, 0, 0, 0.5)'
//           }
//         }
//       }
//     ]
//   }

//   preferenceChartInstance.setOption(option)
// }

// 初始化年龄分布柱状图
const ageData = ref([
  { value: 0, name: '0-10岁' },
  { value: 0, name: '10-30岁' },
  { value: 0, name: '30-50岁' },
  { value: 0, name: '50-70岁' },
  { value: 0, name: '70岁以上' }
])
const initAgeChart = () => {
  if (!ageChart.value) return

  ageChartInstance = echarts.init(ageChart.value)

  const option = {
    title: {
      text: '用户年龄分布',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        // data: ['0-10岁', '10-30岁', '30-50岁', '50-70岁', '70岁以上'],
        data: ageData.value.map(item => item.name),
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '用户数量',
        type: 'bar',
        barWidth: '60%',
        data: ageData.value.map(item => item.value),
        itemStyle: {
          color: '#b9dbff'
        }
      }
    ]
  }

  ageChartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  genderChartInstance?.resize()
  // preferenceChartInstance?.resize()
  ageChartInstance?.resize()
}

onMounted(async () => {
  const res = await getEchartsGender()
  genderData.value[0].value = res.data[0].count
  genderData.value[1].value = res.data[1].count

  const res2 = await getEchartsAge()
  ageData.value = res2.data.map((item: any) => {
    return {
      value: item.count,
      name: `${item.age_group}岁`
    }
  })
  // ageData.value = res2.data.map(item => ({
  //   value: item.count,
  //   name: item.ageGroup
  // }))
  initGenderChart()
  // initPreferenceChart()
  initAgeChart()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  genderChartInstance?.dispose()
  // preferenceChartInstance?.dispose()
  ageChartInstance?.dispose()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>用户分析</h1>
    </div>

    <div class="charts-container">
      <!-- 性别分布饼图 -->
      <div class="chart-card">
        <!-- <h3>用户性别分布</h3> -->
        <div ref="genderChart" class="chart"></div>
      </div>

      <!-- 用户喜好饼图 -->
      <!-- <div class="chart-card"> -->
      <!-- <h3>用户喜好占比</h3> -->
      <!-- <div ref="preferenceChart" class="chart"></div>
      </div> -->

      <!-- 年龄分布柱状图 -->
      <div class="chart-card">
        <!-- <h3>用户年龄分布</h3> -->
        <div ref="ageChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 20px;
  /* background-color: #f5f5f5; */
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  text-align: center;
}

.chart {
  width: 100%;
  height: 350px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 300px;
  }
}
</style>
