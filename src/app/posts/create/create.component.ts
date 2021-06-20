import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostService } from '../../services/post.service';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit, OnDestroy {
  enteredValue: string = '';
  enteredTitle: string = '';
  _mode: string = 'create';
  _id: string | null = null;
  post: Post = {
    title: '',
    content: '',
    id: null,
    imagePath: null,
    creator: '',
  };
  isLoading: boolean = false;
  imagePreview: string | undefined;
  form: FormGroup = new FormGroup({});
  authStatusSub: Subscription = new Subscription();

  constructor(
    public route: ActivatedRoute,
    private postService: PostService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.authStatusSub = this.auth
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    }) as FormGroup;
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this._mode = 'edit';
        this._id = paramMap.get('id') as string;
        this.isLoading = true;
        this.postService.getPostById(this._id).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this._mode = 'create';
        this._id = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLFormElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this._mode === 'create') {
      this.postService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postService.updatePost(
        this._id as string,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}
