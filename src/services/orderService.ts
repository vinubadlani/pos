import { supabase, type Order, type OrderItem } from '../lib/supabase'

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export const orderService = {
  // Create a new order with items
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<OrderWithItems> {
    try {
      // Insert the order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      // Insert the order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: order.id!
      }))

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select()

      if (itemsError) throw itemsError

      return {
        ...order,
        items: insertedItems
      }
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  // Get all orders with items
  async getOrders(): Promise<OrderWithItems[]> {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      return orders.map(order => ({
        ...order,
        items: order.order_items || []
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  },

  // Get a single order by order number
  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_number', orderNumber)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Order not found
        }
        throw error
      }

      return {
        ...order,
        items: order.order_items || []
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  },

  // Update order status
  async updateOrderStatus(orderNumber: string, status: string): Promise<Order> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq('order_number', orderNumber)
        .select()
        .single()

      if (error) throw error
      return order
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: string): Promise<OrderWithItems[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return orders.map(order => ({
        ...order,
        items: order.order_items || []
      }))
    } catch (error) {
      console.error('Error fetching orders by status:', error)
      throw error
    }
  },

  // Get recent orders (last 30 days)
  async getRecentOrders(days: number = 30): Promise<OrderWithItems[]> {
    try {
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - days)

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      return orders.map(order => ({
        ...order,
        items: order.order_items || []
      }))
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      throw error
    }
  }
}
