<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <template>
        <el-table :data="rightsList" style="width: 100%" stripe border>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="authName" label="权限名称" width="360"></el-table-column>
          <el-table-column prop="path" label="路径" width="360"></el-table-column>
          <el-table-column prop="level" label="权限等级" >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.level==='0'">一级</el-tag>
              <el-tag v-if="scope.row.level==='1'" type="success">二级</el-tag>
              <el-tag v-if="scope.row.level==='2'" type="warning">三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>  

<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      } else {
        this.rightsList = res.data
        console.log(this.rightsList)
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>