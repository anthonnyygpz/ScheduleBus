export interface RouteProps {
  id: number;
  name: string;
  created_at?: string;
}

export class Route {
  public readonly id: number;
  public readonly name: string;
  public readonly created_at?: string;

  constructor(props: RouteProps) {
    this.id = props.id;
    this.name = props.name;
    this.created_at = props.created_at;
  }
}
