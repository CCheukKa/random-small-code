#include <iostream>
#include <math.h>
#include <stdio.h>
#include <string>
#include <sstream>
#include <vector>
#include <fstream>
#include <algorithm>
#include <iterator>

using namespace std;


int main(){

    int number, goal;
    int sum;
    cin >> number >> goal;

    if( goal >= 0 ){
        for (int i = 0; i < number - 1; i++)
        {
            int n = floor(goal / (number - 1)) + i;
            sum += n;
            cout << n;
            cout << " ";
        }
        cout << goal - sum;
    } else {
        for (int i = 0; i < number - 1; i++)
        {
            int n = floor(goal * -1 / (number - 1)) + i;
            sum += n;
            cout << n * -1;
            cout << " ";
        }
        cout << goal + sum;
    }

    return 0;
}


