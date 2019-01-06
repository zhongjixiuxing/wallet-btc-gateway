/**
 *  此文件是为了文档说明而存在的
 *
 *  @author anxing<anxing131@gmail.com>
 */


/**
 * @api {get} /index ReadMe
 * @apiGroup ReadMe
 *
 *
 * @apiExample {text} 全局说明
 *      * 所有接口采用Restful - json 风格
 *      * 当请求接口超过相关的频率, 将返回http429的错误状态吗, text为Too many requests, please try again later.
 *      * 正常返回的{err: [错误码], data: [相关数据]}.
 *      * 全局时间采用UTC 标准的时间戳, 精度位毫秒(ms)
 *
 *
 * @apiExample {text} 错误吗列表
 *      null              <==>  成功
 *      ServerError       <==>  服务器内部错误
 *      DuplicateRequest  <==>  重复请求(api幂等性)
 *      NotFound          <==>  相关的资源不存在
 *      ParamsError       <==>  请求参数错误
 *          [{
 *              location: String,
 *              msg: String
 *              param: String 错误参数名称
 *              value: String 请求参数值
 *          }]
 *
 *
 * @apiExample {text} 资源列表
 *      Wallet
 *          id: String, 钱包唯一凭证, UUID V4 格式
 *          name: String, 钱包名称
 *          type: Enum  钱包类型
 *              mnemonic   <==>  助记词
 *          createdAt: Timestamp 创建时间戳(UTC, 精度位ms/毫秒)
 *
 *
 *      WalletCoin
 *          id: String, 钱包唯一凭证, UUID V4 格式
 *          walletId: String 钱包id
 *          createdAt: Timestamp 创建时间戳(UTC, 精度位ms/毫秒)
 *          coin: Enum  货币名称
 *              BTC   <==>
 *              BCH   <==>
 *              ETH   <==>
 *
 *
 * @apiVersion v1.0.0
 */