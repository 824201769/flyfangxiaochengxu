const koa = require('koa') 
const Router = require('koa-router') 
const router=new Router()

const app=new koa() 

app.use(router.routes())

const data = require('./data.js')
router.get('/',(ctx,next)=>{
    ctx.body=data
})
//匹配出现路由出现的东西
app.listen(3000,()=>{
     console.log(`server is started at port 3000`)
})
