import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  password: {
    type: String, 
    required: true,
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
}, {
  timestamps: true,
});

UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const { verifyPassword } = await import('../lib/auth-utils');
  return await verifyPassword(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);