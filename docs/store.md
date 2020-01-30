# store

在 `src/interfaces.d.ts` 中定义页面数据的接口

注意：先实现为每个 Object 各定义一个接口，即使接口完全一样

1. 定义页面数据接口
   1. 存放在 `src/typing` 文件夹下
   2. 将分组名作为目录名，分组名采用 kebab Case 命名法
   3. 一个页面对应一个接口定义文件，文件名为 `{pageKey}.d.ts`，其中 `{pageKey}` 采用首字母小写的 camelCase 命名法
   4. 接口名采用首字母大写的 camelCase 命名法
   5. 如果有嵌套的 `Object` 类型，则也要定义对应的接口，当接口名重复时，增加数字后缀
   6. 如果有嵌套的 `Array` 类型，则数组的类型为 `(string|number|...)[]`，如果元素是 `Object` 类型，则推导出的接口名后加上索引号
2. 在 `State` 接口中定义页面数据变量
   1. 变量名中要包含路径信息，以防止出现同名变量
   2. 变量名采用首字母小写的 camelCase 命名法

创建存储 process 的文件

1. 一个页面对应一个 process 文件
2. 文件路径为 `processes/{分组名}/{文件名}Processes.ts`，路径采用 kebab Case 命名法
3. 文件名采用首字母小写的 camelCase 命名法

创建初始化数据的 process（往 store 中写入初始化数据）

1. 仅用于初始化在设计器中为页面配置的静态默认数据
2. command 的名字为 `initDataCommand`
3. process 的名字为 `initDataProcess`

调用初始化数据的 process（从 store 中获取初始化数据）

1. 如果 store 中不存在页面数据，则调用初始化数据的 process
2. 如果 store 中存在页面数据，则直接从 store 中获取数据（不经过 process）
3. 为每个具有 `dataId` 属性的部件定义一个变量，每个变量都是从 store 中获取数据

销毁数据

1. 在 `changeRouteCommand` 中增加销毁页面数据的操作
