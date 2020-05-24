<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 输入框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
          <!-- 添加按钮 -->
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goodsAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table表格 -->
      <el-table :data="goodslist" style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @ckick="ndn(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodslist: [],
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 分页方法
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 删除商品
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除！')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      }
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    goodsAdd() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 10px;
}
</style>