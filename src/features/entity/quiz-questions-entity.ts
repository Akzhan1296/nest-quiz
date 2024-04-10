import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class QuizQuestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  body: string;

  @Column()
  correctAnswers: string[];

  @Column()
  answer: string;

  @Column({ default: false })
  published: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  // @ManyToOne(() => Quiz, (q) => q.questions)
  // quiz: Quiz;
}
