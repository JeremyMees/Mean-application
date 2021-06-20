import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/models/post';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  postArray: Array<Post> = [];
  _postSub: Subscription = new Subscription();
  isLoading: boolean = false;
  totalPosts: number = 0;
  postPerPage: number = 3;
  currentPage: number = 1;
  pageSizeOptions: Array<number> = [3, 6, 12, 24];
  authStatusListener: Subscription = new Subscription();
  userIsAuthenticated: boolean = false;
  userId_: string | undefined;

  constructor(private postService: PostService, private auth: AuthService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postService.getPostsFromServer(this.postPerPage, this.currentPage);
    this.userId_ = this.auth.getUserId();
    this._postSub = this.postService
      .getPosts()
      .subscribe((response: { posts: Array<Post>; postCount: number }) => {
        this.postArray = response.posts;
        this.totalPosts = response.postCount;
        this.isLoading = false;
      });
    this.userIsAuthenticated = this.auth.getIsAuth();
    this.authStatusListener = this.auth
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId_ = this.auth.getUserId();
      });
  }

  ngOnDestroy(): void {
    this._postSub.unsubscribe();
    this.authStatusListener.unsubscribe();
  }

  onDeletePost(id: string): void {
    this.isLoading = true;
    this.postService.deletePost(id).subscribe(
      () => {
        this.postService.getPostsFromServer(this.postPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onChangePage(data: PageEvent): void {
    this.isLoading = true;
    this.currentPage = data.pageIndex + 1;
    this.postPerPage = data.pageSize;
    this.postService.getPostsFromServer(this.postPerPage, this.currentPage);
  }
}
