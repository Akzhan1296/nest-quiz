import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class QuizQuestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  body: string;

  @Column("text", { array: true, default: [] })
  correctAnswers: string[];

  @Column({ default: false })
  published: boolean;

  @Column()
  createdAt: Date;

  @Column({
    nullable: true,
  })
  updatedAt: Date;

  // @ManyToOne(() => Quiz, (q) => q.questions)
  // quiz: Quiz;
}
