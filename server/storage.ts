import { 
  type User, type InsertUser,
  type Restaurant, type InsertRestaurant,
  type Task, type InsertTask,
  type SupportTicket, type InsertSupportTicket,
  type Article, type InsertArticle,
  type DashboardMetrics, type LearningProgress,
  type OrdersChartData, type DateFilter
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDashboardMetrics(restaurantId?: string, dateFilter?: DateFilter): Promise<DashboardMetrics>;
  getOrdersChartData(period: string, restaurantId?: string, dateFilter?: DateFilter): Promise<OrdersChartData[]>;
  
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, completed: boolean): Promise<Task | undefined>;
  
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  
  getArticles(): Promise<Article[]>;
  
  getLearningProgress(): Promise<LearningProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private restaurants: Map<string, Restaurant>;
  private tasks: Map<string, Task>;
  private supportTickets: Map<string, SupportTicket>;
  private articles: Map<string, Article>;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.tasks = new Map();
    this.supportTickets = new Map();
    this.articles = new Map();
    
    this.seedData();
  }

  private seedData() {
    const defaultRestaurants: Restaurant[] = [
      { id: "1", name: "Mixue Глобус", status: "active", statusMessage: "Активно", isActive: true },
      { id: "2", name: "Mixue Форум", status: "active", statusMessage: "Активно", isActive: true },
    ];
    defaultRestaurants.forEach(r => this.restaurants.set(r.id, r));

    const defaultTasks: Task[] = [
      { id: "1", title: "Обновить фото 3 блюд", completed: false, priority: "medium" },
      { id: "2", title: "В стоп-листе 2 позиции", completed: false, priority: "high" },
      { id: "3", title: "Средний чек упал — рекомендация запустить акцию", completed: false, priority: "low" },
    ];
    defaultTasks.forEach(t => this.tasks.set(t.id, t));

    const defaultTickets: SupportTicket[] = [
      { id: "1", title: "Проблема с оплатой", status: "in_progress", createdAt: "2 часа назад" },
      { id: "2", title: "Вопрос по API", status: "resolved", createdAt: "1 день назад" },
    ];
    defaultTickets.forEach(t => this.supportTickets.set(t.id, t));

    const defaultArticles: Article[] = [
      { id: "1", title: "Как обновлять меню", url: "/knowledge-base/update-menu" },
      { id: "2", title: "Как запускать акции", url: "/knowledge-base/promotions" },
      { id: "3", title: "Как анализировать продажи", url: "/knowledge-base/analytics" },
    ];
    defaultArticles.forEach(a => this.articles.set(a.id, a));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  private restaurantMetrics: Map<string, DashboardMetrics> = new Map([
    ["1", { todayRevenue: 185400, ordersCount: 124, averageCheck: 1495, newGuests: 38 }],
    ["2", { todayRevenue: 142300, ordersCount: 98, averageCheck: 1452, newGuests: 29 }],
  ]);

  private getDateMultiplier(dateFilter?: DateFilter): number {
    if (!dateFilter || dateFilter.type === "today") return 1;
    if (dateFilter.type === "all") return 90;
    if (dateFilter.type === "custom" && dateFilter.startDate && dateFilter.endDate) {
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, days);
    }
    return 1;
  }

  async getDashboardMetrics(restaurantId?: string, dateFilter?: DateFilter): Promise<DashboardMetrics> {
    const multiplier = this.getDateMultiplier(dateFilter);
    
    let baseMetrics: DashboardMetrics;
    
    if (restaurantId && restaurantId !== "all") {
      const metrics = this.restaurantMetrics.get(restaurantId);
      baseMetrics = metrics || { todayRevenue: 0, ordersCount: 0, averageCheck: 0, newGuests: 0 };
    } else {
      let totalRevenue = 0;
      let totalOrders = 0;
      let totalGuests = 0;
      
      this.restaurantMetrics.forEach((m) => {
        totalRevenue += m.todayRevenue;
        totalOrders += m.ordersCount;
        totalGuests += m.newGuests;
      });
      
      baseMetrics = {
        todayRevenue: totalRevenue,
        ordersCount: totalOrders,
        averageCheck: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        newGuests: totalGuests,
      };
    }
    
    return {
      todayRevenue: Math.round(baseMetrics.todayRevenue * multiplier),
      ordersCount: Math.round(baseMetrics.ordersCount * multiplier),
      averageCheck: baseMetrics.averageCheck,
      newGuests: Math.round(baseMetrics.newGuests * multiplier),
    };
  }

  async getOrdersChartData(period: string, restaurantId?: string, dateFilter?: DateFilter): Promise<OrdersChartData[]> {
    const m = (restaurantId && restaurantId !== "all") ? 0.55 : 1;
    
    const weekData: OrdersChartData[] = [
      { label: "Пн", orders: Math.round(85 * m) },
      { label: "Вт", orders: Math.round(92 * m) },
      { label: "Ср", orders: Math.round(78 * m) },
      { label: "Чт", orders: Math.round(101 * m) },
      { label: "Пт", orders: Math.round(138 * m) },
      { label: "Сб", orders: Math.round(162 * m) },
      { label: "Вс", orders: Math.round(145 * m) },
    ];

    const dayData: OrdersChartData[] = [
      { label: "09:00", orders: Math.round(8 * m) },
      { label: "10:00", orders: Math.round(12 * m) },
      { label: "11:00", orders: Math.round(18 * m) },
      { label: "12:00", orders: Math.round(32 * m) },
      { label: "13:00", orders: Math.round(45 * m) },
      { label: "14:00", orders: Math.round(28 * m) },
      { label: "15:00", orders: Math.round(15 * m) },
      { label: "16:00", orders: Math.round(12 * m) },
      { label: "17:00", orders: Math.round(22 * m) },
      { label: "18:00", orders: Math.round(38 * m) },
      { label: "19:00", orders: Math.round(42 * m) },
      { label: "20:00", orders: Math.round(25 * m) },
    ];

    const monthData: OrdersChartData[] = [
      { label: "Неделя 1", orders: Math.round(720 * m) },
      { label: "Неделя 2", orders: Math.round(785 * m) },
      { label: "Неделя 3", orders: Math.round(810 * m) },
      { label: "Неделя 4", orders: Math.round(845 * m) },
    ];

    switch (period) {
      case "day":
        return dayData;
      case "month":
        return monthData;
      default:
        return weekData;
    }
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = randomUUID();
    const restaurant: Restaurant = { ...insertRestaurant, id };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, completed: boolean): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updatedTask = { ...task, completed };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = randomUUID();
    const ticket: SupportTicket = { ...insertTicket, id };
    this.supportTickets.set(id, ticket);
    return ticket;
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getLearningProgress(): Promise<LearningProgress> {
    return {
      completedPercent: 40,
      newLessons: 2,
      checklists: 1,
    };
  }
}

export const storage = new MemStorage();
