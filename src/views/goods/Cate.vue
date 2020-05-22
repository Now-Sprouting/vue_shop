<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- table-tree表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text
        border
        class="tree-table"
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="middle" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="middle" type="success" v-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="middle" type="warning" v-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="middle">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="middle">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.userInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="this.userInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      ></el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="CateDialogVisibleClose"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <!-- 级联选择器 -->
          <el-form-item label="父级分类:" prop="cat_name">
            <el-cascader
              v-model="selectKeys"
              :options="parentCatList"
              :props="{ expandTrigger: 'hover' ,value:'cat_id',
              label:'cat_name',
              children:'children' }"
              @change="parentCateChange"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      cateList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      parentCatList: [],
      selectKeys: []
    }
  },
  methods: {
    //获取商品分类数据列表
    async getCatList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.userInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类列表失败')
      } else {
        this.cateList = res.data.result
        this.total = res.data.total
        // console.log(this.cateList)
      }
    },
    handleSizeChange(newsize) {
      this.userInfo.pagesize = newsize
      this.getCatList()
    },
    handleCurrentChange(newpage) {
      this.userInfo.pagenum = newpage
      this.getCatList()
    },
    showAddCate() {
      this.addCateDialogVisible = true
      this.getParentCatList()
    },
    // 获取父级分类列表
    async getParentCatList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类列表失败')
      } else {
        this.parentCatList = res.data
      }
    },
    // 级联选择器改变
    parentCateChange() {
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCateForm.cat_level = this.selectKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      console.log(this.addCateForm)
    },
    CateDialogVisibleClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  },
  created() {
    this.getCatList()
  }
}
</script>

<style lang="less" scoped>
i {
  font-size: 18px;
}
.tree-table {
  margin-top: 20px;
  font-size: 15px;
}
.el-pagination {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>