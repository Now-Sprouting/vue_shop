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
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="middle"
            @click="editCate(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="middle"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
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
      <!-- 编辑分类对话框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
        @close="editCateDialogVisibleClose"
      >
        <el-form
          :model="editCateForm"
          :rules="editCateFormRules"
          ref="editCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditCate">确 定</el-button>
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
      selectKeys: [],
      editCateDialogVisible: false,
      editCateForm: {
        cat_name: ''
      },
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      editCateId: ''
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
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        } else {
          this.$message.success('添加分类成功')
          this.getCatList()
          this.addCateDialogVisible = false
        }
      })
    },
    // 关闭添加分类对话框
    CateDialogVisibleClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 编辑分类
    async editCate(editCateId) {
      const { data: res } = await this.$http.get('categories/' + editCateId)
      if (res.meta.status !== 200) {
        this.$message.error('查询该数据失败')
      } else {
        this.editCateForm.cat_name = res.data.cat_name
      }
      this.editCateId = editCateId
      this.editCateDialogVisible = true
    },
    // 提交编辑分类
    submitEditCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateId,
          this.editCateForm
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新分类失败')
        } else {
          this.$message.success('更新分类成功')
          this.getCatList()
          this.editCateDialogVisible = false
        }
      })
    },
    // 关闭编辑分类对话框
    editCateDialogVisibleClose() {
      this.editCateDialogVisible = false
    },
    // 删除分类
    async deleteCate(deleteCateId) {
      const confirmResult = await this.$confirm(
        '此操作将删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        // 调用删除用户接口
        const { data: res } = await this.$http.delete(
          'categories/' + deleteCateId
        )
        if (res.meta.status !== 200) {
          return this.$message.err('删除角色失败')
        } else {
          this.$message.success('删除角色成功')
          this.getCatList()
        }
      }
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