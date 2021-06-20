import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Post } from '../models/post';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { PostDB } from '../models/postDB';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = `${environment.apiUrl}/posts`;

@Injectable({
  providedIn: 'root',
})
export class PostService {
  posts_: Array<Post> = [];
  postsUpdated$ = new Subject<{ posts: Array<Post>; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostsFromServer(postsPerPage: number, currentPage: number): void {
    const queryParams: string = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: Array<PostDB>; maxPosts: number }>(
        `${BACKEND_URL}${queryParams}`
      )
      .pipe(
        map((response) => {
          return {
            posts: response.posts.map((post) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: response.maxPosts,
          };
        })
      )
      .subscribe((transformedPostData) => {
        this.posts_ = transformedPostData.posts;
        this.postsUpdated$.next({
          posts: [...this.posts_],
          postCount: transformedPostData.maxPosts,
        });
      });
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  getPosts(): Observable<{ posts: Array<Post>; postCount: number }> {
    return this.postsUpdated$.asObservable();
  }

  getPostById(id: string): Observable<PostDB> {
    return this.http.get<PostDB>(`${BACKEND_URL}/${id}`);
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: File | string
  ): void {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
      };
    }
    this.http.put(`${BACKEND_URL}/${id}`, postData).subscribe((response) => {
      this.router.navigate(['/']);
    });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${BACKEND_URL}/${id}`);
  }
}
