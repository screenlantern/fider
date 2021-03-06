import { User, CurrentUser, AppSettings, Tenant } from '@fider/models';
import { injectable } from '@fider/di';

export interface Session {
  getCurrentUser(): CurrentUser  | undefined;
  getCurrentTenant(): Tenant;
  isAdmin(): boolean;
  isCollaborator(): boolean;
  set<T>(key: string, value: T): void;
  get<T>(key: string): T;
  getArray<T>(key: string): T[];
  getAppSettings(): AppSettings;
  isSingleHostMode(): boolean;
  isProduction(): boolean;
  setCache(key: string, value: string): void;
  getCache(key: string): string | null;
  removeCache(...key: string[]): void;
}

@injectable()
export class BrowserSession implements Session {
  private w: any;

  constructor(window: Window) {
    this.w = window;
    this.w.getCurrentUser = this.getCurrentUser.bind(this);
    this.w.set = this.set.bind(this);
    this.w.get = this.get.bind(this);
  }

  public getCurrentUser(): CurrentUser | undefined {
    const w: any = window;
    if (`_email` in w) {
      w[`_user`].email = w[`_email`];
    }
    return w[`_user`] as CurrentUser;
  }

  public getCurrentTenant(): Tenant {
    const w: any = window;
    return w[`_tenant`] as Tenant;
  }

  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.role === 3;
  }

  public isCollaborator(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.role >= 2;
  }

  public set<T>(key: string, value: T): void {
    this.w[`_${key}`] = value;
  }

  public get<T>(key: string): T {
    return this.w[`_${key}`];
  }

  public getArray<T>(key: string): T[] {
    return this.w[`_${key}`] || [];
  }

  public getAppSettings(): AppSettings {
    return this.get<AppSettings>('settings');
  }

  public isSingleHostMode(): boolean {
    return this.getAppSettings().mode.toLowerCase() === 'single';
  }

  public isProduction(): boolean {
    return this.getAppSettings().environment.toLowerCase() === 'production';
  }

  public setCache(key: string, value: string): void {
    if (this.w.sessionStorage) {
      this.w.sessionStorage.setItem(key, value);
    }
  }

  public getCache(key: string): string | null {
    if (this.w.sessionStorage) {
      return this.w.sessionStorage.getItem(key);
    }
    return null;
  }

  public removeCache(...keys: string[]): void {
    if (this.w.sessionStorage && keys) {
      for (const key of keys) {
        this.w.sessionStorage.removeItem(key);
      }
    }
  }
}
